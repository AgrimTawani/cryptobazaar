import pandas as pd
import difflib
import re
from datetime import datetime

def parse_amount(val_str):
    if not isinstance(val_str, str):
        return 0.0
    val_str = val_str.replace(',', '').strip()
    # Handle cases like "1,234.50 Cr"
    val_str = re.sub(r'[a-zA-Z]', '', val_str).strip()
    try:
        return float(val_str)
    except ValueError:
        return 0.0

def find_metadata_in_text(text_blocks):
    full_text = " ".join(text_blocks)
    
    # Search for account number (9 to 18 digits)
    acc_num = None
    # Look near keywords
    for i, block in enumerate(text_blocks):
        lower_block = block.lower()
        if "a/c" in lower_block or "account" in lower_block or "acc no" in lower_block:
            # Check the current and next few blocks
            local_text = " ".join(text_blocks[max(0, i-1):min(len(text_blocks), i+5)])
            m = re.search(r'\b\d{9,18}\b', local_text)
            if m:
                acc_num = m.group(0)
                break
    
    # Fallback to first 9-18 digit number if not found near keywords
    if not acc_num:
        acc_matches = re.findall(r'\b\d{9,18}\b', full_text)
        if acc_matches:
            acc_num = acc_matches[0]

    # Search for IFSC code (4 letters, 0, 6 alphanumeric)
    ifsc = None
    ifsc_matches = re.findall(r'[A-Z]{4}0[A-Z0-9]{6}', full_text)
    if ifsc_matches:
        ifsc = ifsc_matches[0]

    return {"account_number": acc_num, "ifsc_code": ifsc, "full_text": full_text}

def analyze_bank_statement_json(extracted_data, expected_name=None, expected_account_number=None, expected_ifsc=None):
    text_blocks = []
    rows = []
    
    pages = extracted_data.get("kids", []) if isinstance(extracted_data, dict) else extracted_data
    if not isinstance(pages, list):
        pages = []

    for page in pages:
        for element in page.get("kids", []):
            if element.get("type") in ["paragraph", "heading"]:
                text_blocks.append(element.get("content", ""))
            elif element.get("type") == "table":
                for row in element.get("kids", []):
                    if row.get("type") == "table row":
                        row_data = []
                        for cell in row.get("kids", []):
                            if cell.get("type") == "table cell":
                                cell_texts = []
                                for kid in cell.get("kids", []):
                                    if kid.get("type") == "paragraph" and "content" in kid:
                                        cell_texts.append(kid["content"])
                                row_data.append("\n".join(cell_texts))
                        rows.append(row_data)

    meta = find_metadata_in_text(text_blocks)
    extracted_acc = meta["account_number"]
    extracted_ifsc = meta["ifsc_code"]
    
    extracted_name = None
    if expected_name:
        best_ratio = 0
        best_match = None
        for block in text_blocks:
            if expected_name.lower() in block.lower():
                extracted_name = expected_name
                best_ratio = 1.0
                break
            ratio = difflib.SequenceMatcher(None, expected_name.lower(), block.lower()).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = block
        
        if not extracted_name and best_ratio > 0.6:
            extracted_name = best_match[:50].strip()
            
    verification_result = {
        "name_match": "NOT_FOUND_IN_STATEMENT",
        "account_match": "NOT_FOUND_IN_STATEMENT",
        "ifsc_match": "NOT_FOUND_IN_STATEMENT"
    }
    
    if expected_name:
        verification_result["name_match"] = "MATCHED" if extracted_name else "MISMATCHED"
            
    if expected_account_number:
        if extracted_acc:
            expected_acc_clean = str(expected_account_number).lstrip("0").strip()
            extracted_acc_clean = str(extracted_acc).lstrip("0").strip()
            verification_result["account_match"] = "MATCHED" if expected_acc_clean == extracted_acc_clean else "MISMATCHED"
    
    if expected_ifsc:
        if extracted_ifsc:
            verification_result["ifsc_match"] = "MATCHED" if expected_ifsc.upper().strip() == extracted_ifsc.upper().strip() else "MISMATCHED"

    clean_rows = []
    for r in rows:
        if len(r) >= 7:
            date_str = r[0].strip()
            if re.match(r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}', date_str) or re.match(r'\d{1,2}\s+[a-zA-Z]{3}\s+\d{2,4}', date_str):
                clean_rows.append(r[:7])

    df = pd.DataFrame(clean_rows, columns=["Date", "Narration", "ChqRef", "ValueDt", "Withdrawal", "Deposit", "Balance"])
    
    metadata_res = {
        "extractedName": extracted_name,
        "extractedAccountNumber": extracted_acc,
        "extractedIfscCode": extracted_ifsc,
        "verification": verification_result
    }

    if df.empty:
        return {
            "metadata": metadata_res,
            "metrics": get_default_metrics()
        }

    for col in ["Withdrawal", "Deposit", "Balance"]:
        df[col] = df[col].apply(parse_amount)

    df['DateParsed'] = pd.to_datetime(df['Date'], format='mixed', errors='coerce', dayfirst=True)
    df = df.dropna(subset=['DateParsed']).sort_values('DateParsed')
    
    if df.empty:
        return {
            "metadata": metadata_res,
            "metrics": get_default_metrics()
        }
        
    metrics = calculate_metrics(df)

    return {
        "metadata": metadata_res,
        "metrics": metrics
    }

def get_default_metrics():
    return {
        "avgMonthlyBalance": 0.0,
        "hasRegularIncome": False,
        "inflowSpikeRatio": 0.0,
        "recurringBillCount": 0,
        "transactionModes": [],
        "hasMerchantSpend": False,
        "exchangeTxCount": 0,
        "monthsWithCryptoTrades": 0,
        "hasBidirectionalCrypto": False,
        "maxVolumeSpikeRatio": 0.0,
        "avgUniqueSendersPerMonth": 0.0,
        "senderRecurrenceRate": 0.0,
        "avgCreditToDebitHours": 0.0,
        "roundNumberRatio": 0.0,
        "structuringClustersCount": 0,
        "balanceDropsToZero": 0,
        "returnedPaymentsCount": 0,
        "positiveNetFlowMonths": 0,
    }

def calculate_metrics(df):
    metrics = get_default_metrics()
    
    df['MonthYear'] = df['DateParsed'].dt.to_period('M')
    
    # 1. AVG MONTHLY BALANCE
    daily_balance = df.groupby(df['DateParsed'].dt.date)['Balance'].last()
    metrics['avgMonthlyBalance'] = float(daily_balance.mean()) if not daily_balance.empty else 0.0

    # 2. REGULAR INCOME
    salary_keywords = ['salary', 'sal', 'payroll', 'wages', 'stipend']
    salary_txs = df[df['Narration'].str.lower().str.contains('|'.join(salary_keywords), na=False)]
    metrics['hasRegularIncome'] = not salary_txs.empty

    # 3. INFLOW SPIKE RATIO
    monthly_inflows = df[df['Deposit'] > 0].groupby('MonthYear')['Deposit'].sum()
    avg_monthly_inflow = monthly_inflows.mean()
    max_single_deposit = df['Deposit'].max()
    if avg_monthly_inflow > 0 and pd.notna(max_single_deposit):
        metrics['inflowSpikeRatio'] = float(max_single_deposit / avg_monthly_inflow)

    # 4. RECURRING BILL COUNT
    bill_keywords = ['ach', 'mandate', 'prudential', 'electricity', 'bill', 'insurance', 'emi', 'loan']
    bills = df[df['Narration'].str.lower().str.contains('|'.join(bill_keywords), na=False)]
    metrics['recurringBillCount'] = len(bills)

    # 5. TRANSACTION MODES
    modes = {'UPI': 0, 'NEFT': 0, 'IMPS': 0, 'ACH': 0, 'CASH': 0, 'RTGS': 0}
    for mode in modes.keys():
        modes[mode] = len(df[df['Narration'].str.upper().str.contains(mode, na=False)])
    metrics['transactionModes'] = [m for m, c in modes.items() if c > 0]

    # 6. MERCHANT SPEND
    merchant_keywords = ['zomato', 'zepto', 'dmart', 'mcdonalds', 'breadkraft', 'playstore', 'swiggy', 'amazon', 'flipkart', 'blinkit']
    merchants = df[df['Narration'].str.lower().str.contains('|'.join(merchant_keywords), na=False)]
    metrics['hasMerchantSpend'] = len(merchants) > 0

    # 7 & 8 & 9. CRYPTO / EXCHANGES
    crypto_keywords = ['poker', 'groww', 'zerodha', 'coindcx', 'wazirx', 'binance', 'kraken', 'kucoin', 'zebpay', 'coinswitch', 'upstox', 'angelone']
    crypto_txs = df[df['Narration'].str.lower().str.contains('|'.join(crypto_keywords), na=False)]
    metrics['exchangeTxCount'] = len(crypto_txs)
    metrics['monthsWithCryptoTrades'] = crypto_txs['MonthYear'].nunique()
    
    crypto_deposits = crypto_txs[crypto_txs['Deposit'] > 0]
    crypto_withdrawals = crypto_txs[crypto_txs['Withdrawal'] > 0]
    metrics['hasBidirectionalCrypto'] = bool(not crypto_deposits.empty and not crypto_withdrawals.empty)

    # 10. MAX VOLUME SPIKE RATIO
    df['Volume'] = df['Deposit'] + df['Withdrawal']
    daily_volume = df.groupby(df['DateParsed'].dt.date)['Volume'].sum()
    avg_daily_volume = daily_volume.mean()
    max_daily_volume = daily_volume.max()
    if avg_daily_volume > 0 and pd.notna(max_daily_volume):
        metrics['maxVolumeSpikeRatio'] = float(max_daily_volume / avg_daily_volume)

    # 11 & 12. SENDER RECURRENCE
    upi_deposits = df[(df['Deposit'] > 0) & (df['Narration'].str.contains('UPI', case=False, na=False))]
    senders = upi_deposits['Narration'].str.extract(r'UPI/(?:CR|DR)?/?[A-Z0-9]+/(.+?)/')[0]
    senders = senders.dropna().str.strip()
    if not senders.empty:
        sender_counts = senders.value_counts()
        recurring_senders = len(sender_counts[sender_counts > 1])
        metrics['senderRecurrenceRate'] = float(recurring_senders / len(sender_counts) * 100)
        
        senders_df = pd.DataFrame({'Sender': senders, 'MonthYear': upi_deposits.loc[senders.index, 'MonthYear']})
        unique_senders_per_month = senders_df.groupby('MonthYear')['Sender'].nunique().mean()
        metrics['avgUniqueSendersPerMonth'] = float(unique_senders_per_month)

    # 13. AVG CREDIT TO DEBIT HOURS
    df_sorted = df.sort_values('DateParsed')
    last_credit_date = None
    diffs = []
    for _, row in df_sorted.iterrows():
        if row['Deposit'] > 0:
            last_credit_date = row['DateParsed']
        elif row['Withdrawal'] > 0 and last_credit_date is not None:
            diff_days = (row['DateParsed'] - last_credit_date).days
            diffs.append(diff_days * 24)
            last_credit_date = None
            
    if diffs:
        metrics['avgCreditToDebitHours'] = float(sum(diffs) / len(diffs))

    # 14. ROUND NUMBER RATIO
    round_txs = df[df['Volume'] > 0]
    round_count = len(round_txs[round_txs['Volume'] % 100 == 0])
    if len(round_txs) > 0:
        metrics['roundNumberRatio'] = float(round_count / len(round_txs))

    # 15. STRUCTURING CLUSTERS
    clusters = 0
    for date, group in df.groupby(df['DateParsed'].dt.date):
        counts = group['Volume'].value_counts()
        clusters += len(counts[counts >= 3])
    metrics['structuringClustersCount'] = clusters

    # 16. BALANCE DROPS TO ZERO
    metrics['balanceDropsToZero'] = len(daily_balance[daily_balance < 10.0])

    # 17. RETURNED PAYMENTS
    return_keywords = ['reversal', 'bounce', 'return', 'failed', 'fail', 'declined']
    returned_txs = df[df['Narration'].str.lower().str.contains('|'.join(return_keywords), na=False)]
    metrics['returnedPaymentsCount'] = len(returned_txs)

    # 18. POSITIVE NET FLOW MONTHS
    monthly_net = df.groupby('MonthYear')['Deposit'].sum() - df.groupby('MonthYear')['Withdrawal'].sum()
    metrics['positiveNetFlowMonths'] = len(monthly_net[monthly_net > 0])

    return metrics
