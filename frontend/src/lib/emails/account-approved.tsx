import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  name: string;
}

export default function AccountApprovedEmail({ name }: Props) {
  return (
    <BaseEmail
      previewText="Your CryptoBazaar account has been verified — you can now trade securely"
      ctaLabel="Start Trading"
      ctaUrl="https://cryptobazaar.co.in/marketplace"
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        Welcome to CryptoBazaar
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, your account has been successfully verified. You now have full access to our P2P marketplace to buy and sell stablecoins securely.
      </Text>
      <Text style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>
        By trading on CryptoBazaar, you agree to our Terms &amp; Conditions. All trades are governed by our escrow smart contracts and dispute resolution policy.
      </Text>
    </BaseEmail>
  );
}
