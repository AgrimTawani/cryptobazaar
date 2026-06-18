import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  buyerName: string;
  amount: string;
  asset: string;
  orderId: string;
}

export default function OrderTimedOutEmail({ buyerName, amount, asset }: Props) {
  return (
    <BaseEmail
      previewText="Trade Cancelled: Your payment window has expired"
      ctaLabel="Browse Marketplace"
      ctaUrl="https://cryptobazaar.co.in/marketplace"
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#c00", margin: "0 0 8px" }}>
        Trade Cancelled: Payment Window Expired
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {buyerName}, the payment window for your <strong>{amount} {asset}</strong> trade has expired without confirmation. The order has been automatically cancelled and the assets returned to the marketplace.
      </Text>
    </BaseEmail>
  );
}
