import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  name: string;
}

export default function AccountRejectedEmail({ name }: Props) {
  return (
    <BaseEmail
      previewText="An update regarding your CryptoBazaar account application"
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#c00", margin: "0 0 8px" }}>
        Account Verification Update
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, after a thorough review of your application, we regret to inform you that your account does not currently meet our eligibility requirements.
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        This decision is based on our KYC/AML compliance obligations and the Terms &amp; Conditions you agreed to during registration.
      </Text>
      <Text style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>
        If you believe this is an error or wish to appeal, please contact support@cryptobazaar.co.in within 14 days with any additional information.
      </Text>
    </BaseEmail>
  );
}
