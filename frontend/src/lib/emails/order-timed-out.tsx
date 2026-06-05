import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  buyerName: string;
  amount: string;
  asset: string;
  orderId: string;
}

export default function OrderTimedOutEmail({ buyerName, amount, asset, orderId }: Props) {
  const url = `https://cryptobazaar.co.in/marketplace/${orderId}`;
  return (
    <BaseEmail
      previewText="Your payment window expired — order has been cancelled"
      ctaLabel="Browse Marketplace"
      ctaUrl="https://cryptobazaar.co.in/marketplace"
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#c00", margin: "0 0 8px" }}>
        Payment window expired
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {buyerName}, the 30-minute payment window for your <strong>{amount} {asset}</strong> order has expired without a payment submission. The order has been cancelled and returned to the marketplace.
      </Text>
    </BaseEmail>
  );
}
