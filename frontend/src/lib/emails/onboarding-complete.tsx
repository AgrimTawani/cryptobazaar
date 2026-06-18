import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  name: string;
}

export default function OnboardingCompleteEmail({ name }: Props) {
  return (
    <BaseEmail
      previewText="Your onboarding is complete — pending compliance review"
      ctaLabel="View Dashboard"
      ctaUrl="https://cryptobazaar.co.in/dashboard"
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        Verification Submitted
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, thank you for completing your identity and bank verification. Your profile is currently under review by our compliance team.
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        We will notify you the moment your account is activated and ready for trading on CryptoBazaar.
      </Text>
      <Text style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>
        Review typically takes 1–2 business days. If you have any questions, contact us at support@cryptobazaar.co.in.
      </Text>
    </BaseEmail>
  );
}
