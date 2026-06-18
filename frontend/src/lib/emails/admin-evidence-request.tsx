import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  name: string;
  message: string;
  orderId: string;
  displayId: number;
}

export default function AdminEvidenceRequestEmail({ name, message, orderId, displayId }: Props) {
  const url = `https://cryptobazaar.co.in/marketplace/${orderId}`;
  return (
    <BaseEmail
      previewText={`Action required: Evidence needed for Order #${displayId}`}
      ctaLabel="Respond to Request"
      ctaUrl={url}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        Action Required: Dispute Evidence Needed
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, our dispute resolution team is currently reviewing Order #{displayId}. To proceed with a fair resolution, we require additional information from you:
      </Text>
      <Text style={{ backgroundColor: "#f9f9f9", borderLeft: "3px solid #e5e5e5", padding: "12px 16px", color: "#333", fontSize: 14, lineHeight: 1.6, fontStyle: "italic" }}>
        {message}
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Please upload the requested information to the dispute center as soon as possible. Failure to respond may result in a resolution against you based on available evidence.
      </Text>
      <Text style={{ color: "#aaa", fontSize: 12, lineHeight: 1.6 }}>Order reference: #{displayId}</Text>
      <Text style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>
        If you have any questions, contact support@cryptobazaar.co.in.
      </Text>
    </BaseEmail>
  );
}
