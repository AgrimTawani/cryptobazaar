import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  role: "seller" | "buyer";
  name: string;
  amount: string;
  asset: string;
  totalInr: string;
  utr?: string;
  orderId: string;
}

export default function PaymentSubmittedEmail({ role, name, amount, asset, totalInr, utr, orderId }: Props) {
  const url = `https://cryptobazaar.co.in/marketplace/${orderId}`;
  if (role === "seller") {
    return (
      <BaseEmail
        previewText="Payment confirmation requested by buyer"
        ctaLabel="Verify & Confirm"
        ctaUrl={url}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
          Payment Submitted by Buyer
        </Text>
        <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
          Hi {name}, the buyer has marked the payment of ₹{totalInr} for <strong>{amount} {asset}</strong> as complete{utr ? ` (UTR: <strong>${utr}</strong>)` : ""}. Please verify the deposit in your bank account before releasing the escrow.
        </Text>
      </BaseEmail>
    );
  }
  return (
    <BaseEmail
      previewText="Your payment was logged — awaiting seller confirmation"
      ctaLabel="View Trade"
      ctaUrl={url}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        Payment Confirmation Pending
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, your payment of ₹{totalInr} for <strong>{amount} {asset}</strong> has been securely logged. The seller has been notified and will release the assets from escrow once they verify the funds.
      </Text>
    </BaseEmail>
  );
}
