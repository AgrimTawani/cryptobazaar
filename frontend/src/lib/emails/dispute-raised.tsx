import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  role: "seller" | "buyer" | "admin";
  name: string;
  amount: string;
  asset: string;
  orderId: string;
  raisedByRole: string;
}

export default function DisputeRaisedEmail({ role, name, amount, asset, orderId, raisedByRole }: Props) {
  const url = `https://cryptobazaar.co.in/marketplace/${orderId}`;
  if (role === "admin") {
    return (
      <BaseEmail previewText={`Dispute raised on ${amount} ${asset} order`} ctaLabel="Review Dispute" ctaUrl={url}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#c00", margin: "0 0 8px" }}>
          Dispute Raised — Admin Action Required
        </Text>
        <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
          A dispute has been raised by the <strong>{raisedByRole}</strong> on a <strong>{amount} {asset}</strong> order. Please review and resolve within 24 hours.
        </Text>
      </BaseEmail>
    );
  }
  return (
    <BaseEmail previewText="A dispute has been raised on your trade" ctaLabel="View Dispute" ctaUrl={url}>
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#c00", margin: "0 0 8px" }}>
        Dispute raised on your trade
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, a dispute has been raised on your <strong>{amount} {asset}</strong> trade. Our admin team will review all evidence and resolve within 24 hours. Please do not make any further payments.
      </Text>
    </BaseEmail>
  );
}
