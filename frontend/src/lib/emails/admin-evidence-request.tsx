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
      previewText="Admin has requested additional information regarding your dispute"
      ctaLabel="Respond to Request"
      ctaUrl={url}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        Additional information requested
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, the CryptoBazaar dispute resolution team has reviewed your case and requires additional information before a decision can be made.
      </Text>
      <Text style={{ backgroundColor: "#f9f9f9", borderLeft: "3px solid #e5e5e5", padding: "12px 16px", color: "#333", fontSize: 14, lineHeight: 1.6, fontStyle: "italic" }}>
        {message}
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Please respond with the requested information as soon as possible. Delays in responding may affect the outcome of the dispute resolution.
      </Text>
      <Text style={{ color: "#aaa", fontSize: 12, lineHeight: 1.6 }}>Order reference: #{displayId}</Text>
      <Text style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>
        If you have any questions, contact support@cryptobazaar.co.in.
      </Text>
    </BaseEmail>
  );
}
