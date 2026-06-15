import { createElement } from "react";
import { db } from "@/lib/db";
import { isSecondaryPasswordUnlocked } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";
import { prepareContractCall, sendTransaction, getContract, defineChain } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { thirdwebClient } from "@/lib/thirdweb";
import { notify } from "@/lib/notify";
import DisputeResolvedEmail from "@/lib/emails/dispute-resolved";

async function checkAuth() {
  return isSecondaryPasswordUnlocked();
}

async function signedUrl(key: string | null): Promise<string | null> {
  if (!key) return null;
  try {
    return await getSignedUrl(
      // @ts-expect-error S3Client typing mismatch
      r2,
      new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }),
      { expiresIn: 3600 }
    );
  } catch { return null; }
}

// GET — full dispute detail for admin (includes signed URLs for all evidence)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    const dispute = await db.dispute.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            seller: { select: { id: true, name: true, email: true } },
            buyer:  { select: { id: true, name: true, email: true } },
            chatRoom: {
              include: {
                messages: {
                  orderBy: { createdAt: "asc" },
                  include: { sender: { select: { name: true } } },
                },
              },
            },
          },
        },
        raiser: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { sender: { select: { name: true, avatarUrl: true } } },
        },
      },
    });

    if (!dispute) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [
      paymentScreenshotUrl,
      buyerEvidenceUrl,
      sellerEvidenceUrl,
    ] = await Promise.all([
      signedUrl(dispute.order.paymentScreenshotIpfs ?? null),
      signedUrl(dispute.buyerBankStatementIpfs ?? null),
      signedUrl(dispute.sellerBankStatementIpfs ?? null),
    ]);

    // Signed URLs for any message file attachments
    const messagesWithUrls = await Promise.all(
      dispute.messages.map(async (m) => ({
        ...m,
        fileUrl: await signedUrl(m.fileKey),
      }))
    );

    return NextResponse.json({
      ...dispute,
      paymentScreenshotUrl,
      buyerEvidenceUrl,
      sellerEvidenceUrl,
      messages: messagesWithUrls,
    });
  } catch (err) {
    console.error("[admin/disputes GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH — save admin notes (no resolution)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    const { adminNotes } = await req.json() as { adminNotes: string };

    await db.dispute.update({
      where: { id },
      data: { adminNotes, status: "UNDER_REVIEW" },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/disputes PATCH]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST — resolve dispute (winner = BUYER or SELLER) + call smart contract
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    const { action } = await req.json() as { action: "SELLER" | "BUYER" };

    const dispute = await db.dispute.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            seller: { select: { id: true, walletAddress: true, email: true, name: true } },
            buyer:  { select: { id: true, walletAddress: true, email: true, name: true } },
          },
        },
      },
    });
    if (!dispute) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const winnerAddress = action === "SELLER"
      ? dispute.order.seller.walletAddress
      : dispute.order.buyer?.walletAddress;

    // Call smart contract if admin key + winner wallet address are available
    let contractTxHash: string | null = null;
    const adminKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
    const onChainId = dispute.order.orderId.split("_").pop();
    const escrowAddr = process.env.NEXT_PUBLIC_ESCROW_POLYGON_ADDRESS;
    if (adminKey && winnerAddress && onChainId && escrowAddr) {
      try {
        const chain = defineChain(parseInt(process.env.NEXT_PUBLIC_POLYGON_CHAIN_ID ?? "80002"));
        const account = privateKeyToAccount({ client: thirdwebClient, privateKey: `0x${adminKey.replace(/^0x/, "")}` as `0x${string}` });
        const contract = getContract({ client: thirdwebClient, chain, address: escrowAddr as `0x${string}` });
        const tx = prepareContractCall({
          contract,
          method: "function resolveDispute(uint256 id, address winner) external",
          params: [BigInt(onChainId), winnerAddress as `0x${string}`],
        });
        const result = await sendTransaction({ account, transaction: tx });
        contractTxHash = result.transactionHash;
      } catch (contractErr) {
        console.error("[admin/disputes resolveDispute contract]", contractErr);
        // Don't block DB update if contract call fails — log and continue
      }
    }

    await db.$transaction([
      db.dispute.update({
        where: { id },
        data: {
          status: action === "SELLER" ? "RESOLVED_SELLER" : "RESOLVED_BUYER",
          resolution: action === "SELLER"
            ? "Admin decided in favor of seller. Funds returned to seller."
            : "Admin decided in favor of buyer. Funds released to buyer.",
          resolvedAt: new Date(),
          resolvedBy: "Admin",
        },
      }),
      db.order.update({
        where: { id: dispute.orderId },
        data: {
          status: action === "SELLER" ? "DISPUTE_RESOLVED_SELLER" : "DISPUTE_RESOLVED_BUYER",
          completedAt: new Date(),
        },
      }),
    ]);

    // Email both parties
    const winnerRole = action === "SELLER" ? "seller" : "buyer" as "buyer" | "seller";
    const amount = dispute.order.amount.toString();
    const asset = dispute.order.asset;
    const orderId = dispute.orderId;

    const emailTasks: Promise<void>[] = [];
    if (dispute.order.seller.email) {
      emailTasks.push(notify({
        email: {
          to: dispute.order.seller.email,
          subject: `Dispute resolved — ${action === "SELLER" ? "decision in your favour" : "decision against you"} on ${amount} ${asset} trade`,
          react: createElement(DisputeResolvedEmail, {
            name: dispute.order.seller.name ?? "Seller",
            won: action === "SELLER",
            winnerRole,
            amount,
            asset,
            orderId,
          }),
        },
      }).catch(() => {}));
    }
    if (dispute.order.buyer?.email) {
      emailTasks.push(notify({
        email: {
          to: dispute.order.buyer.email,
          subject: `Dispute resolved — ${action === "BUYER" ? "decision in your favour" : "decision against you"} on ${amount} ${asset} trade`,
          react: createElement(DisputeResolvedEmail, {
            name: dispute.order.buyer.name ?? "Buyer",
            won: action === "BUYER",
            winnerRole,
            amount,
            asset,
            orderId,
          }),
        },
      }).catch(() => {}));
    }
    await Promise.allSettled(emailTasks);

    return NextResponse.json({ success: true, contractTxHash });
  } catch (error) {
    console.error("[Admin Dispute Resolve]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
