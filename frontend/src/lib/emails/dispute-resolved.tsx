import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  name: string;
  won: boolean;
  winnerRole: "buyer" | "seller";
  amount: string;
  asset: string;
  orderId: string;
}

export default function DisputeResolvedEmail({ name, won, winnerRole, amount, asset, orderId }: Props) {
  const url = `https://cryptobazaar.co.in/marketplace/${orderId}`;
  const fundsAction = winnerRole === "seller"
    ? "returned to the seller's wallet"
    : "released to the buyer's wallet";

  if (won) {
    return (
      <BaseEmail
        previewText={`Dispute resolved — decision in your favour on ${amount} ${asset} trade`}
        ctaLabel="View Order"
        ctaUrl={url}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#166534", margin: "0 0 8px" }}>
          Dispute Resolved
        </Text>
        <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
          Hi {name}, following a thorough review of all evidence submitted by both parties, CryptoBazaar's dispute resolution team has determined that this dispute be resolved in your favour.
        </Text>
        <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
          The escrowed <strong>{amount} {asset}</strong> has been {fundsAction}. This determination was made in accordance with CryptoBazaar's Trading Policy and the Terms &amp; Conditions you accepted at registration.
        </Text>
        <Text style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>
          This decision is final and binding. For any questions, contact support@cryptobazaar.co.in.
        </Text>
      </BaseEmail>
    );
  }

  return (
    <BaseEmail
      previewText={`Dispute resolved — decision in favour of ${winnerRole} on ${amount} ${asset} trade`}
      ctaLabel="View Order"
      ctaUrl={url}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#991b1b", margin: "0 0 8px" }}>
        Dispute Resolved
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, following a thorough review of all evidence submitted by both parties, CryptoBazaar's dispute resolution team has determined that this dispute be resolved in favour of the {winnerRole}.
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        The escrowed <strong>{amount} {asset}</strong> has been {fundsAction}. This outcome was determined in accordance with CryptoBazaar's Trading Policy and the Terms &amp; Conditions you accepted at registration, which grant CryptoBazaar the authority to adjudicate disputes and enforce resolutions on-chain.
      </Text>
      <Text style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>
        This decision is final and binding. If you believe this is an error, you may contact support@cryptobazaar.co.in within 7 days.
      </Text>
    </BaseEmail>
  );
}
