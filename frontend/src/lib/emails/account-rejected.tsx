import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  name: string;
}

export default function AccountRejectedEmail({ name }: Props) {
  return (
    <BaseEmail
      previewText="Your CryptoBazaar account application was not approved"
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#c00", margin: "0 0 8px" }}>
        Application not approved
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, after reviewing your onboarding submission, our team has determined that your account does not meet the eligibility requirements for CryptoBazaar at this time.
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        This decision is made in accordance with our Terms &amp; Conditions and KYC/AML compliance obligations, which you agreed to during registration.
      </Text>
      <Text style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>
        If you believe this is an error or wish to appeal, please contact support@cryptobazaar.co.in within 14 days with any additional information.
      </Text>
    </BaseEmail>
  );
}
