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
        previewText={`Action required: ${counterpartyName} has locked your ${amount} ${asset} order`}
        ctaLabel="Open Trade"
        ctaUrl={url}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
          Order Locked: Awaiting Payment
        </Text>
        <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
          Hi {name}, <strong>{counterpartyName}</strong> has initiated a trade for your <strong>{amount} {asset}</strong>. They have <strong>{paymentWindowMins} minutes</strong> to complete the ₹{totalInr} payment. Please monitor your bank account and be ready to confirm receipt.
        </Text>
      </BaseEmail>
    );
  }
  return (
    <BaseEmail
      previewText={`Payment required: Transfer ₹${totalInr} within ${paymentWindowMins} minutes`}
      ctaLabel="Open Trade"
      ctaUrl={url}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        Trade Initiated: Payment Required
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, you have secured <strong>{amount} {asset}</strong> from {counterpartyName}. Please transfer exactly <strong>₹{totalInr}</strong> using the approved payment method within <strong>{paymentWindowMins} minutes</strong> to avoid cancellation.
      </Text>
    </BaseEmail>
  );
}
