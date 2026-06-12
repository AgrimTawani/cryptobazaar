"""
analyzer.py — 19 unique financial health, safety, and stability checks
organized in Groups A (Legitimacy), B (Crypto), C (Inflow Health), D (Stability).

Each check returns a structured result with check_id, name, group,
detected_value, pass_signal description, and pass/fail boolean.
"""

import re
import difflib
import pandas as pd
import numpy as np
from datetime import datetime
from collections import defaultdict
from typing import Optional


# ─── Constants ────────────────────────────────────────────────────────────────

SALARY_KEYWORDS = [
    'salary', 'sal', 'payroll', 'wages', 'stipend', 'income',
    'credit salary', 'monthly pay', 'pension',
]

BILL_KEYWORDS = [
    'electricity', 'electric', 'elec bill', 'power bill',
    'water bill', 'gas bill', 'municipal',
    'broadband', 'internet', 'wifi', 'jio', 'airtel', 'vi ', 'vodafone', 'bsnl',
    'dth', 'tata play', 'dish tv', 'sun direct',
    'netflix', 'hotstar', 'disney', 'prime video', 'spotify', 'youtube premium',
    'ott', 'subscription',
    'insurance', 'lic ', 'star health', 'icici lombard', 'hdfc life',
    'emi', 'loan', 'nach', 'mandate', 'ach', 'autopay', 'auto pay',
    'rent', 'house rent',
]

TRANSACTION_MODES = ['UPI', 'NEFT', 'IMPS', 'RTGS', 'ACH', 'CASH', 'ATM', 'POS', 'ECS']

MERCHANT_KEYWORDS = [
    'zomato', 'swiggy', 'zepto', 'blinkit', 'dunzo', 'bigbasket', 'grofers',
    'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa',
    'dmart', 'reliance', 'more ', 'star bazaar', 'spencer',
    'petrol', 'fuel', 'hp ', 'indian oil', 'bharat petroleum', 'iocl', 'bpcl', 'hpcl',
    'pharmacy', 'medplus', 'apollo', 'netmeds', 'pharmeasy', '1mg',
    'mcdonalds', 'mcd', 'dominos', 'pizza hut', 'kfc', 'starbucks', 'cafe',
    'uber', 'ola', 'rapido',
    'playstore', 'google play', 'app store', 'apple',
    'decathlon', 'croma', 'reliance digital',
    'grocery', 'supermarket', 'mart', 'store',
]

CRYPTO_EXCHANGE_KEYWORDS = [
    'coindcx', 'wazirx', 'binance', 'zebpay', 'coinswitch', 'mudrex',
    'kucoin', 'kraken', 'bybit', 'okx', 'bitbns', 'unocoin',
    'usdt', 'btc', 'crypto', 'p2p',
]

RETURNED_PAYMENT_KEYWORDS = [
    'reversal', 'bounce', 'bounced', 'returned', 'return',
    'failed', 'fail', 'declined', 'dishonour', 'dishonored',
    'nach return', 'ecs return', 'standing instruction fail',
    'insufficient fund', 'insuff fund',
]


# ─── Check Result Builder ────────────────────────────────────────────────────

def _check_result(check_id: str, check_name: str, group: str,
                  detected_value, pass_signal: str, passed: bool,
                  description: str = "") -> dict:
    """Build a standardized check result dict."""
    return {
        "check_id": check_id,
        "check_name": check_name,
        "group": group,
        "detected_value": detected_value,
        "pass_signal": pass_signal,
        "passed": passed,
        "description": description,
    }


# ─── Verification ─────────────────────────────────────────────────────────────

def verify_identity(raw_text: str, extracted_metadata: dict,
                    user_name: Optional[str], user_account_number: Optional[str],
                    user_ifsc: Optional[str]) -> dict:
    """Compare extracted fields with user-provided inputs."""
    result = {
        "extractedName": extracted_metadata.get("account_name"),
        "extractedAccountNumber": extracted_metadata.get("account_number"),
        "extractedIfscCode": extracted_metadata.get("ifsc_code"),
        "verification": {
            "name_match": "NOT_PROVIDED",
            "account_match": "NOT_PROVIDED",
            "ifsc_match": "NOT_PROVIDED",
        }
    }

    # Name verification
    if user_name:
        extracted_name = extracted_metadata.get("account_name")
        if extracted_name:
            if user_name.lower() in extracted_name.lower() or extracted_name.lower() in user_name.lower():
                result["verification"]["name_match"] = "MATCHED"
                result["extractedName"] = extracted_name
            else:
                ratio = difflib.SequenceMatcher(
                    None, user_name.lower(), extracted_name.lower()
                ).ratio()
                if ratio > 0.7:
                    result["verification"]["name_match"] = "MATCHED"
                    result["extractedName"] = extracted_name
                else:
                    result["verification"]["name_match"] = "MISMATCHED"
        else:
            if user_name.lower() in raw_text.lower():
                result["verification"]["name_match"] = "MATCHED"
                result["extractedName"] = user_name
            else:
                best_ratio = 0
                best_match = None
                for line in raw_text.split('\n')[:50]:
                    ratio = difflib.SequenceMatcher(
                        None, user_name.lower(), line.lower()
                    ).ratio()
                    if ratio > best_ratio:
                        best_ratio = ratio
                        best_match = line
                if best_ratio > 0.6:
                    result["verification"]["name_match"] = "MATCHED"
                    result["extractedName"] = best_match[:80].strip() if best_match else None
                else:
                    result["verification"]["name_match"] = "NOT_FOUND_IN_STATEMENT"

    # Account number verification
    if user_account_number:
        extracted_acc = extracted_metadata.get("account_number")
        if extracted_acc:
            clean_user = str(user_account_number).lstrip("0").strip()
            clean_extracted = str(extracted_acc).lstrip("0").strip()
            if clean_user == clean_extracted:
                result["verification"]["account_match"] = "MATCHED"
            else:
                result["verification"]["account_match"] = "MISMATCHED"
        else:
            if str(user_account_number) in raw_text:
                result["verification"]["account_match"] = "MATCHED"
                result["extractedAccountNumber"] = user_account_number
            else:
                result["verification"]["account_match"] = "NOT_FOUND_IN_STATEMENT"

    # IFSC verification
    if user_ifsc:
        extracted_ifsc = extracted_metadata.get("ifsc_code")
        if extracted_ifsc:
            if user_ifsc.upper().strip() == extracted_ifsc.upper().strip():
                result["verification"]["ifsc_match"] = "MATCHED"
            else:
                result["verification"]["ifsc_match"] = "MISMATCHED"
        else:
            if user_ifsc.upper() in raw_text.upper():
                result["verification"]["ifsc_match"] = "MATCHED"
                result["extractedIfscCode"] = user_ifsc.upper()
            else:
                result["verification"]["ifsc_match"] = "NOT_FOUND_IN_STATEMENT"

    return result


# ─── Group A: Account Legitimacy Checks ──────────────────────────────────────

def check_a1_account_age(df: pd.DataFrame) -> dict:
    if df.empty:
        return _check_result("A1", "Account Age", "A", 0,
                             "Statement spans 6+ months (≥180 days)", False,
                             "No transactions found")
    oldest = df['DateParsed'].min()
    newest = df['DateParsed'].max()
    span_days = (newest - oldest).days
    return _check_result("A1", "Account Age", "A", span_days,
                         "Statement spans 6+ months (≥180 days)",
                         span_days >= 180,
                         f"Statement spans {span_days} days ({oldest.strftime('%d-%b-%Y')} to {newest.strftime('%d-%b-%Y')})")


def check_a2_regular_income(df: pd.DataFrame) -> dict:
    if df.empty:
        return _check_result("A2", "Regular Income Credit", "A", False,
                             "At least one recurring credit per month", False,
                             "No transactions found")
    credits = df[df['Deposit'] > 0].copy()
    pattern = '|'.join(SALARY_KEYWORDS)
    salary_txs = credits[credits['Narration'].str.lower().str.contains(pattern, na=False)]
    if salary_txs.empty:
        return _check_result("A2", "Regular Income Credit", "A", False,
                             "At least one recurring credit per month", False,
                             "No salary/income keywords found in credit narrations")
    months_with_salary = salary_txs['DateParsed'].dt.to_period('M').nunique()
    total_months = df['DateParsed'].dt.to_period('M').nunique()
    has_recurring = months_with_salary >= max(1, total_months * 0.5)
    return _check_result("A2", "Regular Income Credit", "A", has_recurring,
                         "At least one recurring credit per month", has_recurring,
                         f"Salary/income transactions found in {months_with_salary}/{total_months} months")


def check_a3_recurring_bills(df: pd.DataFrame) -> dict:
    if df.empty:
        return _check_result("A3", "Recurring Bill Payments", "A", 0,
                             "At least 3 recurring bill-type debits", False,
                             "No transactions found")
    debits = df[df['Withdrawal'] > 0].copy()
    pattern = '|'.join(BILL_KEYWORDS)
    bills = debits[debits['Narration'].str.lower().str.contains(pattern, na=False)]
    count = len(bills)
    return _check_result("A3", "Recurring Bill Payments", "A", count,
                         "At least 3 recurring bill-type debits", count >= 3,
                         f"Found {count} bill/subscription payment transactions")


def check_a4_transaction_diversity(df: pd.DataFrame) -> dict:
    if df.empty:
        return _check_result("A4", "Transaction Type Diversity", "A", [],
                             "At least 2 different transaction modes", False,
                             "No transactions found")
    found_modes = []
    for mode in TRANSACTION_MODES:
        if df['Narration'].str.upper().str.contains(mode, na=False).any():
            found_modes.append(mode)
    return _check_result("A4", "Transaction Type Diversity", "A", found_modes,
                         "At least 2 different transaction modes",
                         len(found_modes) >= 2,
                         f"Transaction modes detected: {', '.join(found_modes) if found_modes else 'None'}")


def check_a5_merchant_spend(df: pd.DataFrame) -> dict:
    if df.empty:
        return _check_result("A5", "Merchant Spend Presence", "A", False,
                             "At least occasional identifiable merchant transactions",
                             False, "No transactions found")
    pattern = '|'.join(MERCHANT_KEYWORDS)
    merchants = df[df['Narration'].str.lower().str.contains(pattern, na=False)]
    has_merchants = len(merchants) > 0
    return _check_result("A5", "Merchant Spend Presence", "A", has_merchants,
                         "At least occasional identifiable merchant transactions",
                         has_merchants,
                         f"Found {len(merchants)} merchant/commercial transactions")


# ─── Group B: Crypto Trading History Checks ──────────────────────────────────

def _get_crypto_txns(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    pattern = '|'.join(CRYPTO_EXCHANGE_KEYWORDS)
    return df[df['Narration'].str.lower().str.contains(pattern, na=False)]


def check_b1_exchange_match(df: pd.DataFrame) -> dict:
    crypto = _get_crypto_txns(df)
    count = len(crypto)
    return _check_result("B1", "Exchange Narration Match", "B", count,
                         "At least 1 confirmed exchange transaction",
                         count >= 1,
                         f"Found {count} crypto/exchange-related transactions")


def check_b2_trading_frequency(df: pd.DataFrame) -> dict:
    crypto = _get_crypto_txns(df)
    if crypto.empty:
        return _check_result("B2", "Trading Frequency", "B", 0,
                             "Exchange transactions in 3+ months",
                             False, "No crypto transactions found")
    months = crypto['DateParsed'].dt.to_period('M').nunique()
    return _check_result("B2", "Trading Frequency", "B", months,
                         "Exchange transactions in 3+ months",
                         months >= 3,
                         f"Crypto transactions present in {months} unique months")


def check_b3_bidirectional_flow(df: pd.DataFrame) -> dict:
    crypto = _get_crypto_txns(df)
    if crypto.empty:
        return _check_result("B3", "Bidirectional Flow", "B", False,
                             "Both crypto inflows and outflows present",
                             False, "No crypto transactions found")
    has_outflow = (crypto['Withdrawal'] > 0).any()
    has_inflow = (crypto['Deposit'] > 0).any()
    bidirectional = bool(has_outflow and has_inflow)
    return _check_result("B3", "Bidirectional Flow", "B", bidirectional,
                         "Both crypto inflows and outflows present",
                         bidirectional,
                         f"Crypto outflows: {'Yes' if has_outflow else 'No'}, "
                         f"Crypto inflows: {'Yes' if has_inflow else 'No'}")


def check_b4_trade_volume_consistency(df: pd.DataFrame) -> dict:
    crypto = _get_crypto_txns(df)
    if crypto.empty:
        return _check_result("B4", "Trade Volume Consistency", "B", 0.0,
                             "No single-month volume spike exceeds 5x monthly average",
                             True, "No crypto transactions to evaluate")
    crypto = crypto.copy()
    crypto['Volume'] = crypto['Withdrawal'] + crypto['Deposit']
    monthly_vol = crypto.groupby(crypto['DateParsed'].dt.to_period('M'))['Volume'].sum()
    if len(monthly_vol) <= 1:
        return _check_result("B4", "Trade Volume Consistency", "B", 0.0,
                             "No single-month volume spike exceeds 5x monthly average",
                             True, "Only 1 month of crypto activity")
    avg_vol = monthly_vol.mean()
    max_vol = monthly_vol.max()
    spike_ratio = float(max_vol / avg_vol) if avg_vol > 0 else 0.0
    return _check_result("B4", "Trade Volume Consistency", "B",
                         round(spike_ratio, 2),
                         "No single-month volume spike exceeds 5x monthly average",
                         spike_ratio <= 5.0,
                         f"Max monthly crypto volume / avg = {spike_ratio:.2f}x")


# ─── Group C: Inflow Health Checks ───────────────────────────────────────────

def _extract_sender(narration: str) -> Optional[str]:
    narration = str(narration).strip()
    upper = narration.upper()
    upi_match = re.search(r'UPI[/\-](?:CR|DR)?[/\-]?[A-Z0-9]+[/\-](.+?)(?:[/\-]|$)', upper)
    if upi_match:
        return upi_match.group(1).strip()
    neft_match = re.search(r'NEFT[/\-](?:[A-Z]{4}0[A-Z0-9]{6}[/\-])?(.+?)(?:[/\-]|$)', upper)
    if neft_match:
        return neft_match.group(1).strip()
    imps_match = re.search(r'IMPS[/\-](?:\d+[/\-])?(.+?)(?:[/\-]|$)', upper)
    if imps_match:
        return imps_match.group(1).strip()
    cleaned = re.sub(r'\d{6,}', '', narration)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned[:50] if cleaned else None


def check_c1_unique_sender_count(df: pd.DataFrame) -> dict:
    credits = df[df['Deposit'] > 0].copy()
    if credits.empty:
        return _check_result("C1", "Unique Inflow Sender Count", "C", 0.0,
                             "Fewer than 15 unique new senders per month on average",
                             True, "No credit transactions found")
    credits['Sender'] = credits['Narration'].apply(_extract_sender)
    credits = credits.dropna(subset=['Sender'])
    credits['MonthYear'] = credits['DateParsed'].dt.to_period('M')
    senders_per_month = credits.groupby('MonthYear')['Sender'].nunique()
    avg = float(senders_per_month.mean()) if not senders_per_month.empty else 0.0
    return _check_result("C1", "Unique Inflow Sender Count", "C",
                         round(avg, 1),
                         "Fewer than 15 unique new senders per month on average",
                         avg < 15,
                         f"Average {avg:.1f} unique senders per month")


def check_c2_sender_recurrence(df: pd.DataFrame) -> dict:
    credits = df[df['Deposit'] > 0].copy()
    if credits.empty:
        return _check_result("C2", "Sender Recurrence Rate", "C", 0.0,
                             "Over 50% of unique inflow senders are recurring",
                             False, "No credit transactions found")
    credits['Sender'] = credits['Narration'].apply(_extract_sender)
    credits = credits.dropna(subset=['Sender'])
    credits['MonthYear'] = credits['DateParsed'].dt.to_period('M')
    if credits.empty:
        return _check_result("C2", "Sender Recurrence Rate", "C", 0.0,
                             "Over 50% of unique inflow senders are recurring",
                             False, "Could not extract sender information")
    sender_month_counts = credits.groupby('Sender')['MonthYear'].nunique()
    total_senders = len(sender_month_counts)
    recurring_senders = len(sender_month_counts[sender_month_counts > 1])
    rate = float(recurring_senders / total_senders * 100) if total_senders > 0 else 0.0
    return _check_result("C2", "Sender Recurrence Rate", "C",
                         round(rate, 1),
                         "Over 50% of unique inflow senders are recurring",
                         rate > 50,
                         f"{recurring_senders}/{total_senders} senders ({rate:.1f}%) appear in multiple months")


def check_c3_credit_debit_velocity(df: pd.DataFrame) -> dict:
    df_sorted = df.sort_values('DateParsed')
    last_credit_date = None
    diffs_hours = []
    for _, row in df_sorted.iterrows():
        if row['Deposit'] > 0:
            last_credit_date = row['DateParsed']
        elif row['Withdrawal'] > 0 and last_credit_date is not None:
            delta = row['DateParsed'] - last_credit_date
            hours = delta.total_seconds() / 3600
            diffs_hours.append(hours)
            last_credit_date = None
    avg_hours = float(np.mean(diffs_hours)) if diffs_hours else 0.0
    return _check_result("C3", "Credit-to-Debit Velocity", "C",
                         round(avg_hours, 1),
                         "Average time between credit and next debit exceeds 24 hours",
                         avg_hours > 24,
                         f"Average gap: {avg_hours:.1f} hours ({avg_hours/24:.1f} days)")


def check_c4_round_number_concentration(df: pd.DataFrame) -> dict:
    credits = df[df['Deposit'] > 0].copy()
    if credits.empty:
        return _check_result("C4", "Round Number Concentration", "C", 0.0,
                             "Round number inflows below 40% of total",
                             True, "No credit transactions found")
    total = len(credits)
    round_count = len(credits[credits['Deposit'].apply(
        lambda x: x >= 1000 and x % 1000 == 0
    )])
    ratio = float(round_count / total) if total > 0 else 0.0
    return _check_result("C4", "Round Number Concentration", "C",
                         round(ratio, 3),
                         "Round number inflows below 40% of total",
                         ratio < 0.40,
                         f"{round_count}/{total} inflows ({ratio*100:.1f}%) are round numbers (multiples of 1000)")


def check_c5_structuring_pattern(df: pd.DataFrame) -> dict:
    credits = df[df['Deposit'] > 0].copy()
    if credits.empty:
        return _check_result("C5", "Structuring Pattern", "C", 0,
                             "No more than 2 same-day multi-sender clusters",
                             True, "No credit transactions found")
    credits['Sender'] = credits['Narration'].apply(_extract_sender)
    credits['TxnDate'] = credits['DateParsed'].dt.date
    cluster_count = 0
    for date, group in credits.groupby('TxnDate'):
        small_credits = group[group['Deposit'] < 50000]
        if len(small_credits) < 2:
            continue
        unique_senders = small_credits['Sender'].nunique()
        total_sum = small_credits['Deposit'].sum()
        if unique_senders >= 2 and total_sum >= 50000:
            cluster_count += 1
    return _check_result("C5", "Structuring Pattern", "C", cluster_count,
                         "No more than 2 same-day multi-sender clusters",
                         cluster_count <= 2,
                         f"Found {cluster_count} potential structuring clusters")


def check_c6_inflow_spike(df: pd.DataFrame) -> dict:
    credits = df[df['Deposit'] > 0].copy()
    if credits.empty:
        return _check_result("C6", "Inflow Spike Detection", "C", 0.0,
                             "No inflow spikes above 3x the 6-month average",
                             True, "No credit transactions found")
    monthly_inflows = credits.groupby(credits['DateParsed'].dt.to_period('M'))['Deposit'].sum()
    if len(monthly_inflows) <= 1:
        return _check_result("C6", "Inflow Spike Detection", "C", 0.0,
                             "No inflow spikes above 3x the 6-month average",
                             True, "Only 1 month of data")
    avg_inflow = monthly_inflows.mean()
    max_inflow = monthly_inflows.max()
    spike_ratio = float(max_inflow / avg_inflow) if avg_inflow > 0 else 0.0
    return _check_result("C6", "Inflow Spike Detection", "C",
                         round(spike_ratio, 2),
                         "No inflow spikes above 3x the 6-month average",
                         spike_ratio <= 3.0,
                         f"Max monthly inflow / avg = {spike_ratio:.2f}x")


# ─── Group D: Financial Stability Checks ─────────────────────────────────────

def check_d1_avg_monthly_balance(df: pd.DataFrame) -> dict:
    if df.empty:
        return _check_result("D1", "Average Monthly Balance", "D", 0.0,
                             "Average balance above ₹5,000",
                             False, "No transactions found")
    daily_balance = df.groupby(df['DateParsed'].dt.date)['Balance'].last()
    avg = float(daily_balance.mean()) if not daily_balance.empty else 0.0
    return _check_result("D1", "Average Monthly Balance", "D",
                         round(avg, 2),
                         "Average balance above ₹5,000",
                         avg >= 5000,
                         f"Average daily closing balance: ₹{avg:,.2f}")


def check_d2_balance_consistency(df: pd.DataFrame) -> dict:
    if df.empty:
        return _check_result("D2", "Balance Consistency", "D", 0,
                             "Balance does not drop below ₹500 more than twice",
                             False, "No transactions found")
    daily_balance = df.groupby(df['DateParsed'].dt.date)['Balance'].last()
    drops = int(len(daily_balance[daily_balance < 500]))
    return _check_result("D2", "Balance Consistency", "D", drops,
                         "Balance does not drop below ₹500 more than twice",
                         drops <= 2,
                         f"Balance dropped below ₹500 on {drops} day(s)")


def check_d3_returned_payments(df: pd.DataFrame) -> dict:
    if df.empty:
        return _check_result("D3", "Returned Payment Check", "D", 0,
                             "Zero returned payments",
                             True, "No transactions found")
    pattern = '|'.join(RETURNED_PAYMENT_KEYWORDS)
    returned = df[df['Narration'].str.lower().str.contains(pattern, na=False)]
    count = len(returned)
    return _check_result("D3", "Returned Payment Check", "D", count,
                         "Zero returned payments",
                         count == 0,
                         f"Found {count} returned/bounced/failed payment(s)")


def check_d4_net_flow_sign(df: pd.DataFrame) -> dict:
    if df.empty:
        return _check_result("D4", "Net Flow Sign", "D", 0,
                             "Net flow positive in at least 4 of 6 months",
                             False, "No transactions found")
    monthly_deposit = df.groupby(df['DateParsed'].dt.to_period('M'))['Deposit'].sum()
    monthly_withdrawal = df.groupby(df['DateParsed'].dt.to_period('M'))['Withdrawal'].sum()
    monthly_net = monthly_deposit - monthly_withdrawal
    positive_months = int(len(monthly_net[monthly_net > 0]))
    total_months = len(monthly_net)
    return _check_result("D4", "Net Flow Sign", "D", positive_months,
                         "Net flow positive in at least 4 of 6 months",
                         positive_months >= 4,
                         f"Positive net flow in {positive_months}/{total_months} months")


# ─── Master Analysis Runner ──────────────────────────────────────────────────

def run_all_checks(df: pd.DataFrame) -> list:
    """Execute all 19 checks and return a list of structured results."""
    return [
        check_a1_account_age(df),
        check_a2_regular_income(df),
        check_a3_recurring_bills(df),
        check_a4_transaction_diversity(df),
        check_a5_merchant_spend(df),
        check_b1_exchange_match(df),
        check_b2_trading_frequency(df),
        check_b3_bidirectional_flow(df),
        check_b4_trade_volume_consistency(df),
        check_c1_unique_sender_count(df),
        check_c2_sender_recurrence(df),
        check_c3_credit_debit_velocity(df),
        check_c4_round_number_concentration(df),
        check_c5_structuring_pattern(df),
        check_c6_inflow_spike(df),
        check_d1_avg_monthly_balance(df),
        check_d2_balance_consistency(df),
        check_d3_returned_payments(df),
        check_d4_net_flow_sign(df),
    ]


def checks_to_flat_metrics(checks: list) -> dict:
    """
    Convert structured check results to the flat metric format
    expected by the existing webhook handler / bankStatementAnalysis DB model.
    """
    lookup = {c['check_id']: c for c in checks}

    def _get(cid, field='detected_value', default=None):
        c = lookup.get(cid)
        if c is None:
            return default
        return c.get(field, default)

    return {
        "accountAgeDays": _get("A1", default=0),
        "hasRegularIncome": _get("A2", default=False),
        "recurringBillCount": _get("A3", default=0),
        "transactionModes": _get("A4", default=[]),
        "hasMerchantSpend": _get("A5", default=False),
        "exchangeTxCount": _get("B1", default=0),
        "monthsWithCryptoTrades": _get("B2", default=0),
        "hasBidirectionalCrypto": _get("B3", default=False),
        "maxVolumeSpikeRatio": _get("B4", default=0.0),
        "avgUniqueSendersPerMonth": _get("C1", default=0.0),
        "senderRecurrenceRate": _get("C2", default=0.0),
        "avgCreditToDebitHours": _get("C3", default=0.0),
        "roundNumberRatio": _get("C4", default=0.0),
        "structuringClustersCount": _get("C5", default=0),
        "inflowSpikeRatio": _get("C6", default=0.0),
        "avgMonthlyBalance": _get("D1", default=0.0),
        "balanceDropsToZero": _get("D2", default=0),
        "returnedPaymentsCount": _get("D3", default=0),
        "positiveNetFlowMonths": _get("D4", default=0),
    }
