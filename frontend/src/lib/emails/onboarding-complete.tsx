import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  name: string;
}

export default function OnboardingCompleteEmail({ name }: Props) {
  return (
    <BaseEmail
      previewText="Your onboarding is complete — pending admin review"
      ctaLabel="View Dashboard"
      ctaUrl="https://cryptobazaar.co.in/dashboard"
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        Onboarding complete
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, you have successfully completed all onboarding steps including identity verification and wallet linking.
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Your account is now pending admin review. We will notify you once your account has been approved and you can begin trading on CryptoBazaar.
      </Text>
      <Text style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>
        Review typically takes 1–2 business days. If you have any questions, contact us at support@cryptobazaar.co.in.
      </Text>
    </BaseEmail>
  );
}
