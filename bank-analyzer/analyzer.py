import pandas as pd
import difflib
import re
from datetime import datetime

def parse_amount(val_str):
    if isinstance(val_str, (int, float)):
        return float(val_str)
    if not isinstance(val_str, str):
        return 0.0
    val_str = val_str.replace(',', '').strip()
    val_str = re.sub(r'[a-zA-Z]', '', val_str).strip()
    try:
        return float(val_str)
    except ValueError:
        return 0.0

def find_metadata_in_text(text_blocks):
    full_text = " ".join(text_blocks)

    # ── Account number ──────────────────────────────────────────────────────
    acc_num = None

    # Priority 1: anchored label patterns (covers pypdf raw text and tagged paragraphs)
    #   "Account No : 50100479552706", "A/C No.: 000123456", "Account Number: 123"
    for pattern in [
        r'(?:account\s*no\.?|a/c\s*no\.?|account\s*number)\s*[:\-]?\s*(\d{9,18})',
        r'(?:acc\.?\s*no\.?)\s*[:\-]?\s*(\d{9,18})',
    ]:
        m = re.search(pattern, full_text, re.IGNORECASE)
        if m:
            acc_num = m.group(1)
            break

    # Priority 2: any 9-18 digit number near keyword context (block-based text)
    if not acc_num:
        for i, block in enumerate(text_blocks):
            lower_block = block.lower()
            if "a/c" in lower_block or "account" in lower_block or "acc no" in lower_block:
                local_text = " ".join(text_blocks[max(0, i - 1):min(len(text_blocks), i + 5)])
                m = re.search(r'\b\d{9,18}\b', local_text)
                if m:
                    acc_num = m.group(0)
                    break

    # ── IFSC code ───────────────────────────────────────────────────────────
    ifsc = None

    # Priority 1: anchored label — "RTGS/NEFT IFSC: HDFC0000182", "IFSC Code: SBIN0001234"
    for pattern in [
        r'(?:rtgs/neft\s+ifsc|ifsc\s*code?|ifsc)\s*[:\-]\s*([A-Z]{4}0[A-Z0-9]{6})',
    ]:
        m = re.search(pattern, full_text, re.IGNORECASE)
        if m:
            ifsc = m.group(1).upper()
            break

    # Priority 2: first bare IFSC pattern in the text
    if not ifsc:
        m = re.search(r'[A-Z]{4}0[A-Z0-9]{6}', full_text)
        if m:
            ifsc = m.group(0)

    # ── Name ────────────────────────────────────────────────────────────────
    name = None

    # Priority 1: salutation prefix — "MR AGRIM TAWANI", "MRS PRIYA SHARMA"
    m = re.search(r'\b(MR|MRS|MS|DR|SHRI|SMT)\.?\s+([A-Z][A-Z\s]{2,40}?)(?:\n|$)', full_text)
    if m:
        name = (m.group(1) + " " + m.group(2)).strip()

    # Priority 2: explicit label — "Customer Name : Agrim Tawani"
    if not name:
        m = re.search(r'(?:customer\s*name|name)\s*[:\-]\s*([A-Za-z][A-Za-z\s]{2,40}?)(?:\n|$)', full_text, re.IGNORECASE)
        if m:
            name = m.group(1).strip()

    # Priority 3: first standalone Title-Case line after "Account Statement" header
    # (covers Kotak format where the name appears as the second line: "Agrim Tawani")
    if not name:
        m = re.search(r'Account Statement[^\n]*\n([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)', full_text)
        if m:
            name = m.group(1).strip()

    return {"account_number": acc_num, "ifsc_code": ifsc, "name": name, "full_text": full_text}

def parse_transactions_from_pypdf(pypdf_text):
    """
    Fallback parser for banks (e.g. Kotak) where opendataloader outputs transactions
    as paragraphs instead of table rows.

    Handles numbered-row format:
      <#> <DD Mon YYYY> <description...> [<ref_no>] <amount> <balance>

    Infers withdrawal vs deposit from balance direction.
    Returns a DataFrame with columns matching the standard table parser.
    """
    if not pypdf_text:
        return pd.DataFrame()

    AMOUNT_PAT = re.compile(r'([\d,]+\.\d{2})')
    TX_HEADER  = re.compile(r'#\s+Date\s+Description', re.IGNORECASE)
    TX_END     = re.compile(r'End of Statement|Account Summary|Statement Generated', re.IGNORECASE)
    TX_START   = re.compile(r'^(\d+)\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\s*(.*)')

    # Collect transaction lines across all pages (skip repeated section headers)
    tx_lines = []
    in_section = False
    skip_next = False
    for line in pypdf_text.split('\n'):
        if TX_HEADER.search(line):
            in_section = True
            skip_next = True
            continue
        if skip_next:
            skip_next = False
            continue
        if TX_END.search(line):
            in_section = False
            continue
        if in_section:
            tx_lines.append(line)

    if not tx_lines:
        return pd.DataFrame()

    # Extract opening balance if present ("- - Opening Balance - - - 50,030.38")
    opening_balance = None
    for line in tx_lines:
        if 'opening balance' in line.lower():
            amounts = AMOUNT_PAT.findall(line)
            if amounts:
                opening_balance = parse_amount(amounts[-1])
            break

    # Group lines into per-transaction blocks
    transactions = []
    current = None
    for line in tx_lines:
        m = TX_START.match(line.strip())
        if m:
            if current:
                transactions.append(current)
            current = {'date': m.group(2), 'lines': [m.group(3)] if m.group(3) else []}
        elif current and line.strip():
            current['lines'].append(line.strip())
    if current:
        transactions.append(current)

    if not transactions:
        return pd.DataFrame()

    # Parse each transaction: last two amounts are tx_amount and balance
    parsed = []
    for tx in transactions:
        full = ' '.join(tx['lines'])
        amounts = AMOUNT_PAT.findall(full)
        if len(amounts) < 2:
            continue
        balance    = parse_amount(amounts[-1])
        tx_amount  = parse_amount(amounts[-2])
        # Narration = everything before the last two amounts
        narration = full
        for amt in amounts[-2:]:
            idx = narration.rfind(amt)
            if idx >= 0:
                narration = narration[:idx]
        parsed.append({'date': tx['date'], 'narration': narration.strip(), 'tx_amount': tx_amount, 'balance': balance})

    if not parsed:
        return pd.DataFrame()

    # Infer withdrawal / deposit from balance change
    rows = []
    prev_balance = opening_balance
    for p in parsed:
        if prev_balance is not None:
            delta = p['balance'] - prev_balance
            withdrawal = p['tx_amount'] if delta < 0 else 0.0
            deposit    = p['tx_amount'] if delta > 0 else 0.0
        else:
            withdrawal, deposit = 0.0, p['tx_amount']
        prev_balance = p['balance']
        rows.append([p['date'], p['narration'], '', p['date'], withdrawal, deposit, p['balance']])

    return pd.DataFrame(rows, columns=['Date', 'Narration', 'ChqRef', 'ValueDt', 'Withdrawal', 'Deposit', 'Balance'])


def analyze_bank_statement_json(extracted_data, expected_name=None, expected_account_number=None, expected_ifsc=None, pypdf_text=None):
    text_blocks = []
    all_cell_texts = []
    rows = []

    # opendataloader_pdf JSON structure:
    #   data.kids -> flat list of elements (tables, paragraphs) — NOT page wrappers
    #   table.rows -> table rows (NOT table.kids)
    #   table_row.cells -> table cells (NOT row.kids)
    #   table_cell.kids -> paragraphs (kids IS correct at this level)
    elements = extracted_data.get("kids", []) if isinstance(extracted_data, dict) else extracted_data
    if not isinstance(elements, list):
        elements = []

    for element in elements:
        if element.get("type") in ["paragraph", "heading"]:
            text_blocks.append(element.get("content", ""))
        elif element.get("type") == "table":
            for row in element.get("rows", []):
                if row.get("type") == "table row":
                    row_data = []
                    for cell in row.get("cells", []):
                        if cell.get("type") == "table cell":
                            cell_texts = []
                            for kid in cell.get("kids", []):
                                if kid.get("type") == "paragraph" and "content" in kid:
                                    cell_texts.append(kid["content"])
                            cell_str = "\n".join(cell_texts)
                            row_data.append(cell_str)
                            if cell_str.strip():
                                all_cell_texts.append(cell_str.strip())
                    rows.append(row_data)

    # Use pypdf raw text (full PDF text) as the primary source for metadata —
    # it captures untagged header sections that opendataloader misses entirely.
    # Fall back to tagged paragraphs, then cell text as last resort.
    if pypdf_text:
        meta_search_blocks = [pypdf_text]
    elif text_blocks:
        meta_search_blocks = text_blocks
    else:
        meta_search_blocks = all_cell_texts

    meta = find_metadata_in_text(meta_search_blocks)
    extracted_acc  = meta["account_number"]
    extracted_ifsc = meta["ifsc_code"]
    extracted_name = meta["name"]  # extracted unconditionally from salutation/label

    # If an expected name is provided, do fuzzy matching to confirm/refine
    if expected_name and not extracted_name:
        best_ratio = 0
        best_match = None
        for block in meta_search_blocks:
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
        if extracted_name:
            expected_clean  = expected_name.lower().strip()
            extracted_clean = extracted_name.lower().strip()
            ratio = difflib.SequenceMatcher(None, expected_clean, extracted_clean).ratio()
            verification_result["name_match"] = "MATCHED" if ratio >= 0.8 or expected_clean in extracted_clean or extracted_clean in expected_clean else "MISMATCHED"
        else:
            verification_result["name_match"] = "MISMATCHED"

    if expected_account_number:
        if extracted_acc:
            expected_acc_clean  = str(expected_account_number).lstrip("0").strip()
            extracted_acc_clean = str(extracted_acc).lstrip("0").strip()
            verification_result["account_match"] = "MATCHED" if expected_acc_clean == extracted_acc_clean else "MISMATCHED"

    if expected_ifsc:
        if extracted_ifsc:
            verification_result["ifsc_match"] = "MATCHED" if expected_ifsc.upper().strip() == extracted_ifsc.upper().strip() else "MISMATCHED"

    clean_rows = []
    for r in rows:
        if len(r) >= 7:
            raw_date = r[0].strip()
            date_match = re.match(r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}', raw_date) or re.match(r'\d{1,2}\s+[a-zA-Z]{3}\s+\d{2,4}', raw_date)
            if date_match:
                row_copy = r[:7]
                row_copy[0] = date_match.group(0)
                clean_rows.append(row_copy)

    if clean_rows:
        df = pd.DataFrame(clean_rows, columns=["Date", "Narration", "ChqRef", "ValueDt", "Withdrawal", "Deposit", "Balance"])
    else:
        # Table parser found nothing — try pypdf text fallback (e.g. Kotak, SBI formats
        # where transactions appear as paragraphs rather than tagged table cells)
        df = parse_transactions_from_pypdf(pypdf_text)
    
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
