import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { UserActions } from "./UserActions";
import { r2 } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) return notFound();

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      bankStatementAnalysis: true,
      onboardingRecords: true,
      walletScreenings: { orderBy: { screenedAt: "desc" }, take: 1 },
    },
  });

  if (!user) return notFound();

  let statementUrl = null;
  let jsonUrl = null;
  let aadhaarDocUrl = null;
  let panDocUrl = null;

  if (user.aadhaarR2Key) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      aadhaarDocUrl = await getSignedUrl(r2 as any, new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: user.aadhaarR2Key }), { expiresIn: 3600 });
    } catch { console.error("Failed to sign aadhaar R2 key"); }
  }
  if (user.panR2Key) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      panDocUrl = await getSignedUrl(r2 as any, new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: user.panR2Key }), { expiresIn: 3600 });
    } catch { console.error("Failed to sign pan R2 key"); }
  }

  const eddRecord = user.onboardingRecords.find((r) => r.layer === "EDD");
  if (eddRecord?.result && typeof eddRecord.result === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultObj = eddRecord.result as any;
    if (resultObj.r2Key) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        statementUrl = await getSignedUrl(r2 as any, new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: resultObj.r2Key }), { expiresIn: 3600 });
      } catch { console.error("Failed to sign R2 key:", resultObj.r2Key); }
    }
    if (resultObj.r2JsonKey) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jsonUrl = await getSignedUrl(r2 as any, new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: resultObj.r2JsonKey }), { expiresIn: 3600 });
      } catch { console.error("Failed to sign R2 JSON key:", resultObj.r2JsonKey); }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-condensed text-3xl uppercase tracking-[1px] mb-1">User Details</h1>
          <p className="font-sans text-sm text-[#888]">ID: {user.id} · {user.email || user.clerkId}</p>
        </div>
        <UserActions userId={user.id} currentStatus={user.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-xl border border-[#e8e8e8] shadow-sm">
          <h2 className="font-condensed text-xl mb-4 border-b border-[#eee] pb-2">Profile</h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <span className="font-sans text-xs font-semibold text-[#888] uppercase">Name</span>
              <span className="font-sans text-sm">{user.name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-xs font-semibold text-[#888] uppercase">Status</span>
              <span className="font-sans text-sm font-bold">{user.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-xs font-semibold text-[#888] uppercase">Joined</span>
              <span className="font-sans text-sm">{user.createdAt.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-xs font-semibold text-[#888] uppercase">Phone</span>
              <span className="font-sans text-sm">{user.phone || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-xs font-semibold text-[#888] uppercase">Date of Birth</span>
              <span className="font-sans text-sm">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("en-IN") : "N/A"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-sans text-xs font-semibold text-[#888] uppercase">Aadhaar (Last 4)</span>
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm">{user.aadhaarLast4 ? `XXXX XXXX ${user.aadhaarLast4}` : "N/A"}</span>
                {aadhaarDocUrl && (
                  <a href={aadhaarDocUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold bg-[#f5f5f5] hover:bg-[#ebebeb] px-2.5 py-1 rounded-md transition-colors font-sans text-[#333] no-underline">
                    View
                  </a>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-sans text-xs font-semibold text-[#888] uppercase">PAN</span>
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm">{user.panMasked || "N/A"}</span>
                {panDocUrl && (
                  <a href={panDocUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold bg-[#f5f5f5] hover:bg-[#ebebeb] px-2.5 py-1 rounded-md transition-colors font-sans text-[#333] no-underline">
                    View
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Screening */}
        <div className="bg-white p-6 rounded-xl border border-[#e8e8e8] shadow-sm">
          <h2 className="font-condensed text-xl mb-4 border-b border-[#eee] pb-2">Wallet Screening</h2>
          {user.walletScreenings.length > 0 ? (() => {
            const s = user.walletScreenings[0];
            const riskColors: Record<string, string> = {
              LOW: "bg-green-100 text-green-800",
              MEDIUM: "bg-yellow-100 text-yellow-800",
              HIGH: "bg-orange-100 text-orange-800",
              BLOCKED: "bg-red-100 text-red-800",
            };
            const flags = Array.isArray(s.flags) ? s.flags as string[] : [];
            const rawResponse = s.rawResponse as Record<string, unknown> | null;
            return (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-xs font-semibold text-[#888] uppercase">Risk Level</span>
                  <span className={`font-sans text-xs font-bold px-2.5 py-1 rounded-full ${riskColors[s.riskLevel] ?? "bg-gray-100 text-gray-700"}`}>
                    {s.riskLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-xs font-semibold text-[#888] uppercase">Risk Score</span>
                  <span className="font-sans text-sm">{s.riskScore ?? "N/A"} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-xs font-semibold text-[#888] uppercase">Provider</span>
                  <span className="font-sans text-sm uppercase">{s.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-xs font-semibold text-[#888] uppercase">Screened At</span>
                  <span className="font-sans text-sm">{s.screenedAt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-xs font-semibold text-[#888] uppercase">Wallet</span>
                  <span className="font-mono text-xs text-[#555] break-all text-right max-w-[60%]">{s.walletAddress}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-sans text-xs font-semibold text-[#888] uppercase">Flags</span>
                  {flags.length === 0 ? (
                    <span className="font-sans text-sm text-green-700">No flags detected</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {flags.map((f) => (
                        <span key={f} className="font-sans text-[0.7rem] font-semibold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                          {f.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {rawResponse && (
                  <details className="mt-2">
                    <summary className="font-sans text-xs text-[#888] cursor-pointer select-none">Raw GoPlus response</summary>
                    <pre className="mt-2 text-[0.7rem] bg-[#f7f7f7] rounded-lg p-3 overflow-x-auto text-[#444] leading-relaxed">
                      {JSON.stringify(rawResponse, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            );
          })() : (
            <p className="font-sans text-sm text-[#888]">No wallet screening on record.</p>
          )}
        </div>

        {/* Bank Analysis */}
        <div className="bg-white p-6 rounded-xl border border-[#e8e8e8] shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-condensed text-xl mb-4 border-b border-[#eee] pb-2">Bank Statement Analysis</h2>
            {user.bankStatementAnalysis ? (
              <div className="flex flex-col gap-3">
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Status</span>
                    <span className="font-sans text-sm font-bold">{user.bankStatementAnalysis.status}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Extracted Name</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.extractedName || "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Extracted Account No</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.extractedAccountNumber || "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Extracted IFSC</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.extractedIfscCode || "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Metadata Match Result</span>
                    <span className="font-sans text-sm">
                      {user.bankStatementAnalysis.metadataVerificationResult
                        ? JSON.stringify(user.bankStatementAnalysis.metadataVerificationResult)
                        : "N/A"}
                    </span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Opening Balance</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.openingBalance != null ? `₹${Number(user.bankStatementAnalysis.openingBalance).toLocaleString()}` : "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Closing Balance</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.closingBalance != null ? `₹${Number(user.bankStatementAnalysis.closingBalance).toLocaleString()}` : "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Avg Monthly Balance</span>
                    <span className="font-sans text-sm">₹{Number(user.bankStatementAnalysis.avgMonthlyBalance || 0).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Regular Income</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.hasRegularIncome ? "Yes" : "No"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Recurring Bill Count</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.recurringBillCount ?? "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Transaction Modes</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.transactionModes?.join(', ') || "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Merchant Spend</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.hasMerchantSpend !== null ? (user.bankStatementAnalysis.hasMerchantSpend ? "Yes" : "No") : "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Exchange Tx Count</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.exchangeTxCount ?? "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Statement Period (Months)</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.statementMonths ?? "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Total Transactions</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.totalTransactionCount ?? "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Max Volume Spike Ratio</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.maxVolumeSpikeRatio ?? "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Avg Unique Senders / Month</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.avgUniqueSendersPerMonth ?? "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Balance Drops To Zero</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.balanceDropsToZero ?? "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Returned Payments Count</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.returnedPaymentsCount ?? "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="font-sans text-xs font-semibold text-[#888] uppercase">Positive Net Flow Months</span>
                    <span className="font-sans text-sm">{user.bankStatementAnalysis.positiveNetFlowMonths ?? "N/A"}</span>
                 </div>
                 {user.bankStatementAnalysis.errorMessage && (
                   <div className="mt-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-sans">
                     {user.bankStatementAnalysis.errorMessage}
                   </div>
                 )}
              </div>
            ) : (
              <p className="font-sans text-sm text-[#888]">No bank statement analysis found for this user.</p>
            )}
          </div>
          {(statementUrl || jsonUrl) && (
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-[#eee]">
              {statementUrl && (
                <a href={statementUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold bg-[#f5f5f5] hover:bg-[#ebebeb] px-4 py-2 rounded-md transition-colors font-sans text-[#333] no-underline">
                  View PDF Statement
                </a>
              )}
              {jsonUrl && (
                <a href={jsonUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold bg-[#f5f5f5] hover:bg-[#ebebeb] px-4 py-2 rounded-md transition-colors font-sans text-[#333] no-underline">
                  View Extracted JSON
                </a>
              )}
            </div>
          )}
        </div>

        {/* Questionnaire / KYC Records */}
        <div className="bg-white p-6 rounded-xl border border-[#e8e8e8] shadow-sm lg:col-span-2">
          <h2 className="font-condensed text-xl mb-4 border-b border-[#eee] pb-2">Onboarding Records (Questionnaire & KYC)</h2>
          {user.onboardingRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-sm">
                <thead>
                  <tr className="border-b border-[#eee]">
                    <th className="py-2 font-semibold text-[#888] uppercase text-xs">Layer</th>
                    <th className="py-2 font-semibold text-[#888] uppercase text-xs">Status</th>
                    <th className="py-2 font-semibold text-[#888] uppercase text-xs">Score</th>
                    <th className="py-2 font-semibold text-[#888] uppercase text-xs">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {user.onboardingRecords.map(rec => (
                    <tr key={rec.layer} className="border-b border-[#f5f5f5] last:border-0">
                      <td className="py-3 font-semibold">{rec.layer}</td>
                      <td className="py-3">{rec.status}</td>
                      <td className="py-3">{rec.score ?? "-"}</td>
                      <td className="py-3 text-[#555]">{rec.rejectionReason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="font-sans text-sm text-[#888]">No onboarding records found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
