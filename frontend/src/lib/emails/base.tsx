import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Preview,
} from "@react-email/components";
import type { ReactNode } from "react";

interface BaseEmailProps {
  previewText: string;
  children: ReactNode;
  ctaLabel?: string;
  ctaUrl?: string;
}

export function BaseEmail({ previewText, children, ctaLabel, ctaUrl }: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: "#f5f5f5", fontFamily: "Arial, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "40px auto", maxWidth: 560, borderRadius: 8, overflow: "hidden" }}>
          {/* Header */}
          <Section style={{ backgroundColor: "#111111", padding: "24px 32px" }}>
            <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "bold", margin: 0, letterSpacing: 1 }}>
              CRYPTOBAZAAR
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ padding: "32px 32px 24px" }}>
            {children}

            {ctaLabel && ctaUrl && (
              <Button
                href={ctaUrl}
                style={{
                  backgroundColor: "#111111",
                  color: "#ffffff",
                  borderRadius: 6,
                  padding: "12px 24px",
                  fontSize: 14,
                  fontWeight: "bold",
                  textDecoration: "none",
                  display: "inline-block",
                  marginTop: 16,
                }}
              >
                {ctaLabel}
              </Button>
            )}
          </Section>

          <Hr style={{ borderColor: "#e5e5e5", margin: 0 }} />

          {/* Footer */}
          <Section style={{ padding: "16px 32px" }}>
            <Text style={{ color: "#999999", fontSize: 12, margin: 0 }}>
              CryptoBazaar · P2P Stablecoin Exchange · India
            </Text>
            <Text style={{ color: "#999999", fontSize: 11, marginTop: 4 }}>
              This email was sent to you because you have an active account on CryptoBazaar.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
