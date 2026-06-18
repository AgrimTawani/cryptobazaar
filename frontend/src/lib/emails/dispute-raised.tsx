import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  role: "seller" | "buyer" | "admin";
  name: string;
  amount: string;
  asset: string;
  orderId: string;
  displayId: number;
  raisedByRole: string;
}

export default function DisputeRaisedEmail({ role, name, amount, asset, orderId, displayId, raisedByRole }: Props) {
  const url = `https://cryptobazaar.co.in/marketplace/${orderId}`;
  if (role === "admin") {
    return (
      <BaseEmail previewText={`Alert: Dispute initiated on ${amount} ${asset} trade`} ctaLabel="Review Dispute" ctaUrl={url}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#c00", margin: "0 0 8px" }}>
          Dispute Alert — Admin Review Required
        </Text>
        <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
          A dispute has been initiated by the <strong>{raisedByRole}</strong> on a <strong>{amount} {asset}</strong> order (#{displayId}). Please review the escrow activity and resolve within 24 hours.
        </Text>
      </BaseEmail>
    );
  }
  return (
    <BaseEmail previewText={`Notice: A dispute was initiated on your ${amount} ${asset} trade`} ctaLabel="View Dispute" ctaUrl={url}>
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#c00", margin: "0 0 8px" }}>
        Dispute Initiated on Trade #{displayId}
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, a dispute has been opened regarding your <strong>{amount} {asset}</strong> trade. Our compliance team will review all escrow activity and evidence to resolve this fairly. Please do not proceed with any off-platform transactions.
      </Text>
    </BaseEmail>
  );
}
