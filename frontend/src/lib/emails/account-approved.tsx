import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  name: string;
}

export default function AccountApprovedEmail({ name }: Props) {
  return (
    <BaseEmail
      previewText="Your CryptoBazaar account has been approved — you can now trade"
      ctaLabel="Start Trading"
      ctaUrl="https://cryptobazaar.co.in/marketplace"
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        Account approved ✓
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, your CryptoBazaar account has been reviewed and approved by our team.
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        You now have full access to the platform and can buy and sell stablecoins on our P2P marketplace.
      </Text>
      <Text style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>
        By trading on CryptoBazaar, you agree to our Terms &amp; Conditions. All trades are governed by our escrow smart contracts and dispute resolution policy.
      </Text>
    </BaseEmail>
  );
}
