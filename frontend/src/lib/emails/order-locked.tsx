import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  role: "seller" | "buyer";
  name: string;
  counterpartyName: string;
  amount: string;
  asset: string;
  totalInr: string;
  orderId: string;
  paymentWindowMins: number;
}

export default function OrderLockedEmail({ role, name, counterpartyName, amount, asset, totalInr, orderId, paymentWindowMins }: Props) {
  const url = `https://cryptobazaar.co.in/marketplace/${orderId}`;
  if (role === "seller") {
    return (
      <BaseEmail
        previewText={`${counterpartyName} locked your ${amount} ${asset} order — action needed`}
        ctaLabel="Open Trade"
        ctaUrl={url}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
          Buyer locked your order ⚡
        </Text>
        <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
          Hi {name}, <strong>{counterpartyName}</strong> has locked your listing for <strong>{amount} {asset}</strong> (₹{totalInr}). They have <strong>{paymentWindowMins} minutes</strong> to send you the INR payment. Please stay available to confirm once payment is received.
        </Text>
      </BaseEmail>
    );
  }
  return (
    <BaseEmail
      previewText={`You locked ${amount} ${asset} — send ₹${totalInr} within ${paymentWindowMins} minutes`}
      ctaLabel="Open Trade"
      ctaUrl={url}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        Order locked — send payment now
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, you have locked <strong>{amount} {asset}</strong> from {counterpartyName}. Please send <strong>₹{totalInr}</strong> via your chosen payment method and submit proof within <strong>{paymentWindowMins} minutes</strong>.
      </Text>
    </BaseEmail>
  );
}
