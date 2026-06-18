import { Text, Section } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  name: string;
  device: string;
  location: string;
  ipAddress: string;
  time: string;
}

export default function LoginDetectedEmail({ name, device, location, ipAddress, time }: Props) {
  return (
    <BaseEmail
      previewText={`New login to your CryptoBazaar account from ${device}`}
      ctaLabel="Contact Support"
      ctaUrl="mailto:support@cryptobazaar.co.in"
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        New Login Detected
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, we noticed a new login to your CryptoBazaar account. If this was you, there is nothing you need to do.
      </Text>
      <Section style={{ backgroundColor: "#f9f9f9", border: "1px solid #e5e5e5", padding: "16px", borderRadius: "8px", margin: "16px 0" }}>
        <Text style={{ color: "#333", fontSize: 14, margin: "0 0 8px" }}><strong>Device:</strong> {device}</Text>
        <Text style={{ color: "#333", fontSize: 14, margin: "0 0 8px" }}><strong>Location:</strong> {location}</Text>
        <Text style={{ color: "#333", fontSize: 14, margin: "0 0 8px" }}><strong>IP Address:</strong> {ipAddress}</Text>
        <Text style={{ color: "#333", fontSize: 14, margin: 0 }}><strong>Time:</strong> {time}</Text>
      </Section>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        If you did not authorize this login, your account may be compromised. Please click the button below to contact our support team immediately to secure your account and freeze all trading activity.
      </Text>
    </BaseEmail>
  );
}
