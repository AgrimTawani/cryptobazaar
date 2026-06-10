import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    const userId = parseInt(data.user_id, 10);
    const existingRecord = await db.onboardingRecord.findUnique({
      where: { userId_layer: { userId, layer: "EDD" } },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Prepare updated result object, preserving the r2Key
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentResult = existingRecord.result as any || {};
    const updatedResult = { ...currentResult, r2JsonKey: data.r2_json_key };

    if (data.status === "VERIFICATION_FAILED" || data.status === "LOCKED_PDF" || data.status === "EXTRACTION_FAILED") {
      await db.onboardingRecord.update({
        where: { userId_layer: { userId, layer: "EDD" } },
        data: {
          status: "FAILED",
          rejectionReason: data.error || "Analysis failed",
          result: updatedResult,
          completedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true });
    }

    if (data.status === "COMPLETED") {
      await db.bankStatementAnalysis.upsert({
        where: { userId },
        create: {
          userId,
          status: data.status,
          extractedName: data.extractedName,
          extractedAccountNumber: data.extractedAccountNumber,
          extractedIfscCode: data.extractedIfscCode,
          metadataVerificationResult: data.metadataVerificationResult,
          hasRegularIncome: data.hasRegularIncome,
          recurringBillCount: data.recurringBillCount,
          transactionModes: data.transactionModes,
          hasMerchantSpend: data.hasMerchantSpend,
          exchangeTxCount: data.exchangeTxCount,
          monthsWithCryptoTrades: data.monthsWithCryptoTrades,
          hasBidirectionalCrypto: data.hasBidirectionalCrypto,
          maxVolumeSpikeRatio: data.maxVolumeSpikeRatio,
          avgUniqueSendersPerMonth: data.avgUniqueSendersPerMonth,
          senderRecurrenceRate: data.senderRecurrenceRate,
          avgCreditToDebitHours: data.avgCreditToDebitHours,
          roundNumberRatio: data.roundNumberRatio,
          structuringClustersCount: data.structuringClustersCount,
          inflowSpikeRatio: data.inflowSpikeRatio,
          avgMonthlyBalance: data.avgMonthlyBalance,
          balanceDropsToZero: data.balanceDropsToZero,
          returnedPaymentsCount: data.returnedPaymentsCount,
          positiveNetFlowMonths: data.positiveNetFlowMonths,
        },
        update: {
          status: data.status,
          extractedName: data.extractedName,
          extractedAccountNumber: data.extractedAccountNumber,
          extractedIfscCode: data.extractedIfscCode,
          metadataVerificationResult: data.metadataVerificationResult,
          hasRegularIncome: data.hasRegularIncome,
          recurringBillCount: data.recurringBillCount,
          transactionModes: data.transactionModes,
          hasMerchantSpend: data.hasMerchantSpend,
          exchangeTxCount: data.exchangeTxCount,
          monthsWithCryptoTrades: data.monthsWithCryptoTrades,
          hasBidirectionalCrypto: data.hasBidirectionalCrypto,
          maxVolumeSpikeRatio: data.maxVolumeSpikeRatio,
          avgUniqueSendersPerMonth: data.avgUniqueSendersPerMonth,
          senderRecurrenceRate: data.senderRecurrenceRate,
          avgCreditToDebitHours: data.avgCreditToDebitHours,
          roundNumberRatio: data.roundNumberRatio,
          structuringClustersCount: data.structuringClustersCount,
          inflowSpikeRatio: data.inflowSpikeRatio,
          avgMonthlyBalance: data.avgMonthlyBalance,
          balanceDropsToZero: data.balanceDropsToZero,
          returnedPaymentsCount: data.returnedPaymentsCount,
          positiveNetFlowMonths: data.positiveNetFlowMonths,
        }
      });

      // Update OnboardingRecord. The status remains PENDING for manual admin approval.
      await db.onboardingRecord.update({
        where: { userId_layer: { userId, layer: "EDD" } },
        data: {
          result: updatedResult,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, warning: "Unknown status" });

  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
