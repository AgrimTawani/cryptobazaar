import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  name: string;
  won: boolean;
  winnerRole: "buyer" | "seller";
  amount: string;
  asset: string;
  orderId: string;
  displayId: number;
}

export default function DisputeResolvedEmail({ name, won, winnerRole, amount, asset, orderId, displayId }: Props) {
  const url = `https://cryptobazaar.co.in/marketplace/${orderId}`;
  const fundsAction = winnerRole === "seller"
    ? "returned to the seller's wallet"
    : "released to the buyer's wallet";

  if (won) {
    return (
      <BaseEmail
        previewText={`Dispute ruling: Favourable decision on ${amount} ${asset} trade`}
        ctaLabel="View Order"
        ctaUrl={url}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#166534", margin: "0 0 8px" }}>
          Dispute Resolved in Your Favour
        </Text>
        <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
          Hi {name}, following a comprehensive review of the evidence, our compliance team has ruled in your favour.
        </Text>
        <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
          The escrowed <strong>{amount} {asset}</strong> has been {fundsAction}. This determination was made securely in accordance with CryptoBazaar's Trading Policy.
        </Text>
        <Text style={{ color: "#aaa", fontSize: 12, lineHeight: 1.6 }}>Order reference: #{displayId}</Text>
        <Text style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>
          This decision is final and binding. For any questions, contact support@cryptobazaar.co.in.
        </Text>
      </BaseEmail>
    );
  }

  return (
    <BaseEmail
      previewText={`Dispute ruling: Decision rendered on ${amount} ${asset} trade`}
      ctaLabel="View Order"
      ctaUrl={url}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#991b1b", margin: "0 0 8px" }}>
        Dispute Resolution Notice
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {name}, after a comprehensive review of all provided evidence, our compliance team has resolved this dispute in favour of the {winnerRole}.
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        The escrowed <strong>{amount} {asset}</strong> has been {fundsAction}. This outcome was determined in accordance with CryptoBazaar's Trading Policy and Terms of Service.
      </Text>
      <Text style={{ color: "#aaa", fontSize: 12, lineHeight: 1.6 }}>Order reference: #{displayId}</Text>
      <Text style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>
        This decision is final and binding. If you believe this is an error, you may contact support@cryptobazaar.co.in within 7 days.
      </Text>
    </BaseEmail>
  );
}
