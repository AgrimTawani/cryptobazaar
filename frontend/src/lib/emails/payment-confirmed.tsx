import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  buyerName: string;
  amount: string;
  asset: string;
  payout: string;
  orderId: string;
}

export default function PaymentConfirmedEmail({ buyerName, amount, asset, payout, orderId }: Props) {
  const url = `https://cryptobazaar.co.in/marketplace/${orderId}`;
  return (
    <BaseEmail
      previewText={`${payout} ${asset} released to your wallet`}
      ctaLabel="View Trade"
      ctaUrl={url}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        Trade complete — {payout} {asset} sent ✅
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {buyerName}, the seller confirmed your payment. <strong>{payout} {asset}</strong> has been released to your wallet (1 {asset} platform fee deducted from {amount} {asset}).
      </Text>
    </BaseEmail>
  );
}
