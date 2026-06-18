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
      previewText={`Order cancelled by buyer — your ${amount} ${asset} listing is active again`}
      ctaLabel="View Listing"
      ctaUrl={url}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        Order Cancelled by Buyer
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {sellerName}, the buyer has cancelled their lock on your <strong>{amount} {asset}</strong> listing. Your assets remain secure in escrow, and your listing is immediately available on the marketplace for new buyers.
      </Text>
    </BaseEmail>
  );
}
