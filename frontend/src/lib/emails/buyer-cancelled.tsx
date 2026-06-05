import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  sellerName: string;
  amount: string;
  asset: string;
  orderId: string;
}

export default function BuyerCancelledEmail({ sellerName, amount, asset, orderId }: Props) {
  const url = `https://cryptobazaar.co.in/marketplace/${orderId}`;
  return (
    <BaseEmail
      previewText={`Buyer cancelled — your ${amount} ${asset} listing is open again`}
      ctaLabel="View Listing"
      ctaUrl={url}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        Buyer cancelled the order
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {sellerName}, the buyer cancelled the lock on your <strong>{amount} {asset}</strong> listing. Your order is now open again and available on the marketplace.
      </Text>
    </BaseEmail>
  );
}
