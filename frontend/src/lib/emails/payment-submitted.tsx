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
        previewText="Buyer submitted payment proof — verify and confirm"
        ctaLabel="Verify & Confirm"
        ctaUrl={url}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
          Payment proof submitted ⚠️
        </Text>
        <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
          Hi {name}, the buyer has submitted payment proof for <strong>{amount} {asset}</strong> (₹{totalInr}){utr ? ` with UTR <strong>${utr}</strong>` : ""}. Please check your bank account and confirm once the funds arrive.
        </Text>
      </BaseEmail>
    );
  }
  return (
    <BaseEmail
      previewText="Payment submitted — waiting for seller confirmation"
      ctaLabel="View Trade"
      ctaUrl={url}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        Payment submitted
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, your payment of ₹{totalInr} for <strong>{amount} {asset}</strong> has been submitted. The seller will confirm once they receive the funds. This usually takes a few minutes.
      </Text>
    </BaseEmail>
  );
}
