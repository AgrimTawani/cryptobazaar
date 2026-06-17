import { Text } from "@react-email/components";
import { BaseEmail } from "./base";

interface Props {
  sellerName: string;
  amount: string;
  asset: string;
  pricePerUnit: string;
  orderId: string;
  displayId: number;
}

export default function OrderCreatedEmail({ sellerName, amount, asset, pricePerUnit, orderId, displayId }: Props) {
  const url = `https://cryptobazaar.co.in/marketplace/${orderId}`;
  return (
    <BaseEmail
      previewText={`Your ${amount} ${asset} listing is live on CryptoBazaar`}
      ctaLabel="View Listing"
      ctaUrl={url}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111", margin: "0 0 8px" }}>
        Your listing is live 🎉
      </Text>
      <Text style={{ color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        Hi {sellerName}, your order to sell <strong>{amount} {asset}</strong> at ₹{pricePerUnit}/unit is now live on the marketplace. You will be notified as soon as a buyer locks your order.
      </Text>
      <Text style={{ color: "#aaa", fontSize: 12, lineHeight: 1.6 }}>
        Order reference: #{displayId}
      </Text>
    </BaseEmail>
  );
}
