"""
extractor.py — Robust PDF bank statement extraction engine using pdfplumber.

Extracts raw text, reconstructs transactions into a unified DataFrame,
and pulls metadata (account holder name, account number, IFSC code).
Designed to handle diverse Indian bank statement formats (HDFC, SBI, Kotak,
ICICI, Axis, etc.) with adaptive date/amount normalization.
"""

import re
import pdfplumber
import pandas as pd
from datetime import datetime
from typing import Optional


# ─── Date Patterns ────────────────────────────────────────────────────────────

DATE_PATTERNS = [
    # DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    (r'\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})\b', '%d/%m/%Y'),
    # DD/MM/YY or DD-MM-YY
    (r'\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2})\b', '%d/%m/%y'),
    # DD MMM YYYY (e.g., "01 Jan 2024")
    (r'\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b', '%d %b %Y'),
    # DD-MMM-YYYY (e.g., "01-Jan-2024")
    (r'\b(\d{1,2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{4})\b', '%d-%b-%Y'),
    # DD MMM YY (e.g., "01 Jan 24")
    (r'\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{2})\b', '%d %b %y'),
    # DD-MMM-YY (e.g., "01-Jan-24")
    (r'\b(\d{1,2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2})\b', '%d-%b-%y'),
    # YYYY-MM-DD (ISO format)
    (r'\b(\d{4})-(\d{2})-(\d{2})\b', '%Y-%m-%d'),
]

# Compiled master regex to detect if a line starts with a date
DATE_LINE_REGEX = re.compile(
    r'^\s*(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2,4}|\d{1,2}-(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2,4}|\d{4}-\d{2}-\d{2})',
    re.IGNORECASE
)

# Amount pattern: optional minus, digits with optional commas, decimal part
AMOUNT_PATTERN = re.compile(r'-?\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?')


def parse_date(date_str: str) -> Optional[datetime]:
    """Try to parse a date string against known Indian bank statement formats."""
    date_str = date_str.strip()
    for pattern, fmt in DATE_PATTERNS:
        m = re.match(pattern, date_str, re.IGNORECASE)
        if m:
            matched_text = m.group(0)
            try:
                return datetime.strptime(matched_text, fmt)
            except ValueError:
                continue
    # Fallback: pandas parser
    try:
        return pd.to_datetime(date_str, dayfirst=True).to_pydatetime()
    except Exception:
        return None


def parse_amount(val: str) -> float:
    """Parse an amount string, stripping commas and non-numeric suffixes."""
    if not isinstance(val, str):
        try:
            return float(val) if val is not None else 0.0
        except (ValueError, TypeError):
            return 0.0
    val = val.strip()
    # Remove Cr/Dr suffixes
    val = re.sub(r'\s*(Cr|Dr|CR|DR)\s*$', '', val)
    val = val.replace(',', '').strip()
    # Remove any remaining non-numeric chars except minus and dot
    val = re.sub(r'[^\d.\-]', '', val)
    try:
        return float(val) if val else 0.0
    except ValueError:
        return 0.0


# ─── PDF Extraction ───────────────────────────────────────────────────────────

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract raw text from all pages of a PDF using pdfplumber."""
    all_text = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                all_text.append(text)
    return "\n".join(all_text)


def extract_tables_from_pdf(pdf_path: str) -> list:
    """Extract tables from all pages using pdfplumber's table extractor."""
    all_tables = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            if tables:
                all_tables.extend(tables)
    return all_tables


# ─── Metadata Extraction ─────────────────────────────────────────────────────

def extract_metadata(raw_text: str) -> dict:
    """
    Extract account holder name, account number, and IFSC code
    from the raw header text of a bank statement.
    """
    lines = raw_text.split('\n')

    # --- Account Number ---
    account_number = None
    # Try keyword-proximity search first
    acc_keywords = [
        r'a/c\s*(?:no\.?|number|#)?',
        r'account\s*(?:no\.?|number|#)?',
        r'acc\.?\s*(?:no\.?|number|#)?',
    ]
    for keyword_pat in acc_keywords:
        for line in lines:
            m = re.search(keyword_pat + r'\s*[:\-]?\s*(\d{9,18})', line, re.IGNORECASE)
            if m:
                account_number = m.group(1)
                break
        if account_number:
            break

    # Fallback: look for long digit sequences in the first 30 lines (header area)
    if not account_number:
        header_text = "\n".join(lines[:30])
        acc_matches = re.findall(r'\b(\d{9,18})\b', header_text)
        if acc_matches:
            account_number = acc_matches[0]

    # --- IFSC Code ---
    ifsc_code = None
    ifsc_match = re.search(r'\b([A-Z]{4}0[A-Z0-9]{6})\b', raw_text)
    if ifsc_match:
        ifsc_code = ifsc_match.group(1)

    # --- Account Holder Name ---
    account_name = None
    name_keywords = [
        r'(?:account\s*holder|customer\s*name|name\s*of\s*(?:the\s*)?account\s*holder|a/c\s*holder|holder\s*name)',
        r'(?:mr\.?|mrs\.?|ms\.?|shri|smt)\s+',
    ]
    for keyword_pat in name_keywords:
        for line in lines[:30]:
            m = re.search(keyword_pat + r'\s*[:\-]?\s*(.+)', line, re.IGNORECASE)
            if m:
                candidate = m.group(1).strip()
                # Clean up trailing numbers, dates, pipes
                candidate = re.sub(r'\s*[\|].*$', '', candidate)
                candidate = re.sub(r'\s+\d{9,}.*$', '', candidate)
                candidate = candidate.strip(' :,-')
                if len(candidate) > 2 and not candidate.isdigit():
                    account_name = candidate[:80]
                    break
        if account_name:
            break

    return {
        "account_name": account_name,
        "account_number": account_number,
        "ifsc_code": ifsc_code,
    }


# ─── Transaction Reconstruction ──────────────────────────────────────────────

def _split_mega_rows(tables: list) -> list:
    """
    Some banks (HDFC) pack all transactions into a single table row
    with newline-separated values in each cell. This function detects
    that pattern and splits them into individual rows.

    For amount columns (withdrawal/deposit), HDFC uses sparse entries —
    not every transaction row has a value. We derive W/D from consecutive
    balance differences instead.
    """
    expanded = []
    # Track the last known balance across mega-rows for cross-page continuity
    last_balance = None

    for table in tables:
        if not table:
            continue
        for row in table:
            if not row:
                continue
            # Clean None values
            cleaned = [str(cell).strip() if cell else '' for cell in row]

            # Check if the first non-empty cell has multiple lines
            date_cell = cleaned[0] if cleaned else ''
            date_lines = [l.strip() for l in date_cell.split('\n') if l.strip()]

            # If multiple date-like entries exist, this is a mega-row
            date_count = sum(1 for l in date_lines if parse_date(l) is not None)

            if date_count > 1:
                col_lines = []
                for cell in cleaned:
                    lines = [l.strip() for l in cell.split('\n') if l.strip()]
                    col_lines.append(lines)

                date_col_lines = col_lines[0]
                n_txns = len(date_col_lines)

                # Balance column (last) — should have exactly n_txns entries
                balance_lines = col_lines[-1] if col_lines else []
                while len(balance_lines) < n_txns:
                    balance_lines.append('')

                # Parse all balances
                balances = [parse_amount(b) for b in balance_lines[:n_txns]]

                # Derive withdrawal/deposit from balance changes
                withdrawal_vals = []
                deposit_vals = []
                for i in range(n_txns):
                    current_bal = balances[i]
                    if i == 0:
                        prev_bal = last_balance if last_balance is not None else current_bal
                    else:
                        prev_bal = balances[i - 1]

                    diff = current_bal - prev_bal
                    if diff < 0:
                        withdrawal_vals.append(str(abs(diff)))
                        deposit_vals.append('')
                    elif diff > 0:
                        withdrawal_vals.append('')
                        deposit_vals.append(str(diff))
                    else:
                        withdrawal_vals.append('')
                        deposit_vals.append('')

                # Update last_balance for next mega-row
                if balances:
                    last_balance = balances[-1]

                # Narration and ref columns
                narr_col = col_lines[1] if len(col_lines) > 1 else []
                ref_col = col_lines[2] if len(col_lines) > 2 else []
                value_dt_col = col_lines[3] if len(col_lines) > 3 else []

                narr_per_txn = _distribute_lines_to_dates(narr_col, n_txns)
                ref_per_txn = _distribute_lines_to_dates(ref_col, n_txns)

                for i in range(n_txns):
                    new_row = [
                        date_col_lines[i] if i < len(date_col_lines) else '',
                        narr_per_txn[i] if i < len(narr_per_txn) else '',
                        ref_per_txn[i] if i < len(ref_per_txn) else '',
                        value_dt_col[i] if i < len(value_dt_col) else '',
                        withdrawal_vals[i] if i < len(withdrawal_vals) else '',
                        deposit_vals[i] if i < len(deposit_vals) else '',
                        balance_lines[i] if i < len(balance_lines) else '',
                    ]
                    expanded.append(new_row)
            else:
                expanded.append(cleaned)
                # If this is a normal data row, try to track its balance
                # for cross-table continuity (check last cell for a number)
                if cleaned:
                    last_cell = cleaned[-1]
                    parsed_bal = parse_amount(last_cell)
                    if parsed_bal > 0:
                        last_balance = parsed_bal

    return expanded


def _distribute_lines_to_dates(lines: list, n_txns: int) -> list:
    """
    Distribute narration/ref lines across n_txns transactions.
    If we have exactly n_txns lines, use 1:1. Otherwise, distribute
    evenly or concatenate excess lines.
    """
    if not lines:
        return [''] * n_txns
    if len(lines) == n_txns:
        return lines
    if len(lines) < n_txns:
        # Pad
        result = lines + [''] * (n_txns - len(lines))
        return result
    # More lines than txns — group them
    # Rough distribution: ceil(len/n_txns) lines per txn
    result = []
    per_txn = max(1, len(lines) // n_txns)
    idx = 0
    for i in range(n_txns):
        if i == n_txns - 1:
            # Last txn gets all remaining
            chunk = lines[idx:]
        else:
            chunk = lines[idx:idx + per_txn]
        result.append(' '.join(chunk))
        idx += per_txn
    return result


def _try_table_parsing(tables: list) -> Optional[pd.DataFrame]:
    """
    Attempt to build a transaction DataFrame from pdfplumber-extracted tables.
    Handles varying column counts, header labels, and HDFC-style mega-rows.
    """
    if not tables:
        return None

    # First, expand mega-rows (HDFC format)
    all_rows = _split_mega_rows(tables)

    if not all_rows:
        return None

    # Try to identify header row and map columns
    header_mappings = {
        'date': ['date', 'txn date', 'transaction date', 'value date', 'val date', 'posting date'],
        'narration': ['narration', 'description', 'particulars', 'details', 'remarks', 'transaction details', 'txn description'],
        'withdrawal': ['withdrawal', 'debit', 'withdrawals', 'debit amount', 'dr', 'dr.', 'amount(dr)', 'withdrawalamt'],
        'deposit': ['deposit', 'credit', 'deposits', 'credit amount', 'cr', 'cr.', 'amount(cr)', 'depositamt'],
        'balance': ['balance', 'closing balance', 'running balance', 'available balance', 'bal', 'closingbalance'],
        'ref': ['ref', 'reference', 'chq/ref', 'cheque no', 'ref no', 'chq', 'chq no', 'instrument', 'chq./ref'],
    }

    col_indices = {}
    data_start = 0

    # Check each row as a potential header
    for row_idx, row in enumerate(all_rows[:5]):
        row_lower = [c.lower().strip().replace('.', '').replace(' ', '') for c in row]
        matches_found = 0
        temp_indices = {}

        for col_name, aliases in header_mappings.items():
            for alias in aliases:
                alias_clean = alias.replace('.', '').replace(' ', '')
                for ci, cell in enumerate(row_lower):
                    if alias_clean in cell:
                        if col_name not in temp_indices:
                            temp_indices[col_name] = ci
                            matches_found += 1
                        break

        if matches_found >= 3:
            col_indices = temp_indices
            data_start = row_idx + 1
            break

    if not col_indices or 'date' not in col_indices:
        return None

    # Build DataFrame from data rows
    records = []
    for row in all_rows[data_start:]:
        if len(row) <= col_indices['date']:
            continue

        date_str = row[col_indices['date']].split('\n')[0].strip()
        parsed_date = parse_date(date_str)
        if not parsed_date:
            continue

        # Skip "Opening Balance" type rows
        narration = ''
        if 'narration' in col_indices and col_indices['narration'] < len(row):
            narration = row[col_indices['narration']].replace('\n', ' ')
        if 'opening balance' in narration.lower() or narration.strip() == '-':
            continue

        withdrawal_str = row[col_indices['withdrawal']] if 'withdrawal' in col_indices and col_indices['withdrawal'] < len(row) else ''
        deposit_str = row[col_indices['deposit']] if 'deposit' in col_indices and col_indices['deposit'] < len(row) else ''
        balance_str = row[col_indices['balance']] if 'balance' in col_indices and col_indices['balance'] < len(row) else ''

        record = {
            'Date': date_str,
            'DateParsed': parsed_date,
            'Narration': narration,
            'Ref': row[col_indices.get('ref', -1)].replace('\n', ' ') if 'ref' in col_indices and col_indices['ref'] < len(row) else '',
            'Withdrawal': parse_amount(withdrawal_str),
            'Deposit': parse_amount(deposit_str),
            'Balance': parse_amount(balance_str),
        }
        records.append(record)

    if not records:
        return None

    return pd.DataFrame(records)


def _try_text_parsing(raw_text: str) -> Optional[pd.DataFrame]:
    """
    Fallback: reconstruct transactions from raw text lines.
    Handles multiline narrations and page breaks.
    """
    lines = raw_text.split('\n')
    transactions = []
    current_txn = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Check if this line starts with a date (new transaction)
        date_match = DATE_LINE_REGEX.match(line)
        if date_match:
            # Save previous transaction
            if current_txn:
                transactions.append(current_txn)

            date_str = date_match.group(0).strip()
            parsed_date = parse_date(date_str)
            rest_of_line = line[date_match.end():].strip()

            # Extract amounts from the rest of the line
            amounts = AMOUNT_PATTERN.findall(rest_of_line)
            amounts_float = [parse_amount(a) for a in amounts]

            # Remove amounts from the narration
            narration = rest_of_line
            for amt_str in amounts:
                narration = narration.replace(amt_str, '', 1)
            narration = re.sub(r'\s{2,}', ' ', narration).strip()

            # Heuristic: last amount is usually balance, second-to-last is the txn amount
            withdrawal = 0.0
            deposit = 0.0
            balance = 0.0

            if len(amounts_float) >= 3:
                balance = amounts_float[-1]
                # Determine if debit or credit based on balance change
                txn_amt = amounts_float[-2]
                # If there's a previous txn, compare balances
                if transactions and transactions[-1]['Balance'] > 0:
                    prev_balance = transactions[-1]['Balance']
                    if balance < prev_balance:
                        withdrawal = txn_amt
                    else:
                        deposit = txn_amt
                else:
                    # Can't determine, guess from narration keywords
                    debit_hints = ['withdrawal', 'debit', 'purchase', 'payment', 'transfer to', 'neft-']
                    if any(h in narration.lower() for h in debit_hints):
                        withdrawal = txn_amt
                    else:
                        deposit = txn_amt
            elif len(amounts_float) == 2:
                balance = amounts_float[-1]
                txn_amt = amounts_float[0]
                if transactions and transactions[-1]['Balance'] > 0:
                    prev_balance = transactions[-1]['Balance']
                    if balance < prev_balance:
                        withdrawal = txn_amt
                    else:
                        deposit = txn_amt
            elif len(amounts_float) == 1:
                balance = amounts_float[0]

            current_txn = {
                'Date': date_str,
                'DateParsed': parsed_date,
                'Narration': narration,
                'Ref': '',
                'Withdrawal': withdrawal,
                'Deposit': deposit,
                'Balance': balance,
            }
        elif current_txn:
            # Continuation line — append to current narration
            # But skip if it looks like a page header/footer
            skip_patterns = [
                r'page\s+\d+', r'statement\s+of', r'opening\s+balance',
                r'closing\s+balance', r'continued', r'branch\s*:',
            ]
            is_skip = any(re.search(p, line, re.IGNORECASE) for p in skip_patterns)
            if not is_skip and len(line) > 2:
                current_txn['Narration'] += ' ' + line

    # Don't forget the last transaction
    if current_txn:
        transactions.append(current_txn)

    if not transactions:
        return None

    return pd.DataFrame(transactions)


def reconstruct_transactions(pdf_path: str, raw_text: str) -> pd.DataFrame:
    """
    Build a unified transaction DataFrame. Tries table extraction first,
    then falls back to raw text parsing.
    """
    # Strategy 1: Table extraction
    tables = extract_tables_from_pdf(pdf_path)
    df = _try_table_parsing(tables)

    if df is not None and len(df) >= 3:
        return df

    # Strategy 2: Raw text parsing
    df = _try_text_parsing(raw_text)
    if df is not None and len(df) >= 1:
        return df

    # Return empty DataFrame with expected schema
    return pd.DataFrame(columns=[
        'Date', 'DateParsed', 'Narration', 'Ref',
        'Withdrawal', 'Deposit', 'Balance'
    ])


# ─── Main Extraction Pipeline ────────────────────────────────────────────────

def extract_from_pdf(pdf_path: str) -> dict:
    """
    Full extraction pipeline:
    1. Extract raw text
    2. Extract metadata (name, account number, IFSC)
    3. Reconstruct transaction DataFrame

    Returns:
        {
            "raw_text": str,
            "metadata": { "account_name", "account_number", "ifsc_code" },
            "transactions": pd.DataFrame
        }
    """
    raw_text = extract_text_from_pdf(pdf_path)
    metadata = extract_metadata(raw_text)
    transactions = reconstruct_transactions(pdf_path, raw_text)

    # Ensure DateParsed is proper datetime and sort
    if not transactions.empty and 'DateParsed' in transactions.columns:
        transactions['DateParsed'] = pd.to_datetime(
            transactions['DateParsed'], errors='coerce'
        )
        transactions = transactions.dropna(subset=['DateParsed'])
        transactions = transactions.sort_values('DateParsed').reset_index(drop=True)

    return {
        "raw_text": raw_text,
        "metadata": metadata,
        "transactions": transactions,
    }
