# Skullu 2.0 — School Finance Engine
## Master Implementation Plan

> **Goal:** A double-entry-aware, multi-tenant school finance system that handles every Kenyan school's money flow — fee collection, receipting, expense control, payroll deductions, bank reconciliation, and financial reporting — accurately, with a full audit trail, and with zero cross-school data leakage.

---

## Guiding Principles

1. **Multi-tenant by default** — every table has `school_id`. Every query uses the `BelongsToTenant` scope. No exceptions.
2. **Immutable payments** — payments are never deleted or edited. They are reversed with a credit note or refund record.
3. **Running balance** — every student has a real-time ledger balance (charges − payments). Never compute from raw totals at query time in a loop.
4. **Numbered documents** — every receipt, invoice, expense claim, and refund gets a school-scoped sequential number (e.g. `KASEE-RCT-2026-00142`).
5. **Audit trail** — all financial writes log to `audit_logs` (who, what, before, after, IP).
6. **Term & year isolation** — fees and balances are always scoped to `academic_year` + `term`. A student's balance in Term 1 does not bleed into Term 2.
7. **KES-first** — amounts stored as integers (cents/lowest unit) to avoid floating-point drift. Display layer divides by 100.

---

## Current State (What Already Exists)

| Asset | Status |
|-------|--------|
| `fee_structures` table | ✅ exists — only `name` + `total_amount`, needs line-item expansion |
| `student_fee_payments` table | ✅ exists — basic, missing ledger linkage |
| `invoices` table | ⚠️ platform-level only (subscriptions), not student invoices |
| `BudgetCategory` model | ✅ exists |
| `StudentFeePayment` model | ✅ exists |
| `FeeStructure` model | ✅ exists |
| Finance UI components (27 files) | ✅ rebuilt to manifesto style |
| Finance API routes | ❌ missing — no accountant-facing controllers |
| M-Pesa integration | ❌ missing |
| Receipt numbering | ❌ missing |
| Student ledger | ❌ missing |
| Expense management | ❌ missing |
| Bank reconciliation | ❌ missing |

---

## Phase 1 — Foundation (Core Ledger)
**Scope:** Fee structures, student invoicing, payment collection, receipts, defaulters

### 1.1 Database Migrations

#### `fee_structure_items` (expand the basic fee_structures)
```
school_id (FK schools)
fee_structure_id (FK fee_structures)
name          — "Tuition Fee", "Activity Levy", "Caution Money"
amount        — integer (cents)
is_optional   — boolean
is_recurring  — boolean (charged each term vs once-off)
applicable_to — enum: all | boarding | day | grade:{n}
sort_order
```

#### `student_fee_invoices` (per-student, per-term invoice)
```
school_id (FK schools)
student_id (FK students)
invoice_number        — school-scoped sequential e.g. KASEE-INV-2026-T1-00042
academic_year         — "2026"
term                  — "1" | "2" | "3"
fee_structure_id      — snapshot of which structure was used
total_charged         — integer (sum of all items at invoice time)
total_paid            — integer (updated on each payment)
balance               — integer (generated column or updated field)
status                — enum: draft | issued | partial | paid | overpaid | cancelled
issued_at
due_date
notes
created_by (FK users)
```

#### `student_invoice_items` (line items per invoice)
```
school_id
invoice_id (FK student_fee_invoices)
fee_structure_item_id (nullable — for ad-hoc charges)
description
amount        — integer
discount      — integer (applied discount)
surcharge     — integer (late payment surcharge)
net_amount    — computed: amount - discount + surcharge
```

#### `fee_payments` (replaces/extends student_fee_payments)
```
school_id (FK schools)
invoice_id (FK student_fee_invoices)
student_id (FK students)
receipt_number        — e.g. KASEE-RCT-2026-00142
amount                — integer (always positive)
payment_method        — enum: cash | mpesa | bank_transfer | cheque | standing_order | card
mpesa_code            — nullable (Safaricom transaction code)
bank_ref              — nullable
cheque_number         — nullable
bank_account_id       — nullable (FK bank_accounts)
payment_date
term, academic_year
received_by (FK users — cashier)
verified_by (FK users — nullable)
status                — enum: pending | confirmed | bounced | reversed
reversal_id           — nullable (self-referential FK for reversed payments)
notes
```

#### `fee_receipts` (printable receipt metadata)
```
school_id
payment_id (FK fee_payments)
receipt_number (denormalised for fast lookup)
printed_at
printed_by
email_sent_at
sms_sent_at
```

#### `student_discounts`
```
school_id
student_id
invoice_id (nullable — global or invoice-specific)
discount_type    — enum: scholarship | sibling | staff_child | bursary | sponsorship | custom
amount_or_pct    — integer
is_percentage    — boolean
reason
approved_by (FK users)
valid_from, valid_to
```

#### `sponsorships`
```
school_id
student_id
sponsor_name
sponsor_contact
amount_per_term   — integer
covers            — string (e.g. "Full fees", "Tuition only")
start_term, start_year
end_term, end_year
active
notes
```

#### `surcharges`
```
school_id
invoice_id
student_id
amount       — integer
reason       — enum: late_payment | returned_cheque | custom
auto_applied — boolean
applied_at
applied_by (FK users)
```

---

### 1.2 Backend Controllers

**`app/Http/Controllers/Accountant/`**

| Controller | Routes | Description |
|-----------|--------|-------------|
| `InvoiceController` | GET/POST/PATCH | List, create, issue, cancel student invoices |
| `PaymentController` | GET/POST | Record payment, generate receipt, list by student |
| `ReceiptController` | GET | View, print, email/SMS receipt |
| `FeeStructureController` | CRUD | Manage fee structures and line items |
| `DefaulterController` | GET | Students with balance > 0, aged analysis |
| `DiscountController` | CRUD | Student discounts and scholarships |
| `SponsorshipController` | CRUD | Manage sponsorships |
| `SurchargeController` | GET/POST | Auto/manual surcharge application |
| `DailyCollectionController` | GET | Daily cash/M-Pesa/bank collection summary |
| `ReceiptsRegisterController` | GET | All receipts in date range |

**Service class: `app/Services/Finance/FeeService.php`**
- `issueInvoice(student, term, year)` — creates invoice from fee structure
- `bulkIssueInvoices(class_id, term, year)` — issues for entire class
- `recordPayment(invoice_id, amount, method, ...)` — atomic: creates payment + updates invoice totals + creates receipt
- `applyDiscount(invoice_id, discount)` — recalculates balances
- `applySurcharge(invoice_id, amount, reason)` — adds surcharge
- `reversePayment(payment_id, reason)` — marks reversed, creates reversal record
- `getStudentLedger(student_id, year, term)` — returns full charge/payment timeline

**Receipt number generator: `app/Services/Finance/ReceiptNumberService.php`**
- Per-school sequential counter using DB lock: `SELECT FOR UPDATE`
- Format: `{SCHOOL_CODE}-RCT-{YEAR}-{NNNNN}`

---

### 1.3 API Routes (add to `routes/api.php` under accountant middleware)

```php
// Fee Structures
Route::apiResource('finance/fee-structures', FeeStructureController::class);
Route::apiResource('finance/fee-structures.items', FeeStructureItemController::class);

// Invoices
Route::get('finance/invoices',                 [InvoiceController::class, 'index']);
Route::post('finance/invoices',                [InvoiceController::class, 'store']);       // single
Route::post('finance/invoices/bulk-issue',     [InvoiceController::class, 'bulkIssue']);   // whole class
Route::get('finance/invoices/{id}',            [InvoiceController::class, 'show']);
Route::patch('finance/invoices/{id}/cancel',   [InvoiceController::class, 'cancel']);

// Payments & Receipts
Route::post('finance/payments',                [PaymentController::class, 'store']);
Route::patch('finance/payments/{id}/reverse',  [PaymentController::class, 'reverse']);
Route::get('finance/receipts',                 [ReceiptController::class, 'index']);
Route::get('finance/receipts/{id}',            [ReceiptController::class, 'show']);
Route::post('finance/receipts/{id}/email',     [ReceiptController::class, 'email']);
Route::post('finance/receipts/{id}/sms',       [ReceiptController::class, 'sms']);

// Student ledger
Route::get('finance/students/{id}/ledger',     [PaymentController::class, 'ledger']);
Route::get('finance/students/{id}/statement',  [PaymentController::class, 'statement']);   // PDF

// Defaulters
Route::get('finance/defaulters',               [DefaulterController::class, 'index']);
Route::get('finance/defaulters/export',        [DefaulterController::class, 'export']);    // CSV

// Daily Collection
Route::get('finance/daily-collection',         [DailyCollectionController::class, 'index']);
Route::get('finance/receipts-register',        [ReceiptsRegisterController::class, 'index']);

// Discounts & Sponsorships
Route::apiResource('finance/discounts',        DiscountController::class);
Route::apiResource('finance/sponsorships',     SponsorshipController::class);
Route::apiResource('finance/surcharges',       SurchargeController::class);
```

---

## Phase 2 — Expense & Petty Cash Management
**Scope:** School expenditure, expense categories, petty cash, fund requests, budget vs actual

### 2.1 Database Migrations

#### `expense_categories`
```
school_id
name            — "Salaries", "Utilities", "Stationery", "Maintenance", "Transport", etc.
code            — short code e.g. UTIL, STAT
budget_monthly  — integer (monthly allocation)
parent_id       — nullable (self-referential for sub-categories)
```

#### `expenses`
```
school_id
expense_number      — e.g. KASEE-EXP-2026-00018
category_id (FK expense_categories)
description
amount              — integer
payment_method      — enum: cash | mpesa | bank_transfer | cheque
bank_account_id     — nullable
mpesa_code, bank_ref, cheque_number
expense_date
attachment_path     — receipt/invoice scan
status              — enum: draft | pending_approval | approved | rejected | paid
approved_by (FK users)
approved_at
paid_by (FK users)
paid_at
academic_year, term
notes
```

#### `petty_cash_accounts`
```
school_id
name            — "Main Office", "Kitchen", "Transport Office"
custodian_id (FK users)
current_balance — integer
imprest_limit   — integer (max float allowed)
```

#### `petty_cash_transactions`
```
school_id
account_id (FK petty_cash_accounts)
type            — enum: top_up | expense | reimbursement
amount          — integer
description
reference
transaction_date
recorded_by (FK users)
```

#### `fund_transfer_requests`
```
school_id
from_account_id   — nullable (null = outside source)
to_account_id     — nullable (null = external)
amount            — integer
reason
status            — enum: pending | approved | executed | rejected
requested_by (FK users)
approved_by (FK users)
executed_at
reference
```

### 2.2 Controllers

| Controller | Description |
|-----------|-------------|
| `ExpenseController` | CRUD expenses with approval workflow |
| `ExpenseCategoryController` | Manage categories with budget limits |
| `PettyCashController` | Petty cash top-up, spend, reconcile |
| `FundTransferController` | Approve and execute transfers |

### 2.3 Budget vs Actual Engine

`BudgetService::getVsActual(school_id, year, term)`
- Per category: budgeted amount, amount spent, % used, remaining
- Alert when > 80% of category budget consumed
- Returns data for the Budget Planner UI chart

---

## Phase 3 — Bank & M-Pesa Integration
**Scope:** Bank accounts, bank reconciliation, M-Pesa STK Push, C2B paybill listener

### 3.1 Database Migrations

#### `bank_accounts`
```
school_id
bank_name       — "Equity", "KCB", "Co-op", "NCBA", "Absa", etc.
account_name
account_number  — encrypted
branch
account_type    — enum: current | savings | mpesa_paybill
mpesa_shortcode — nullable (Safaricom paybill/till number)
current_balance — integer (last known reconciled balance)
as_of_date      — last reconciliation date
is_primary      — boolean
```

#### `bank_statements` (imported CSV/manual entries)
```
school_id
bank_account_id
transaction_date
value_date
description
credit          — integer
debit           — integer
running_balance — integer
reference
matched_payment_id  — nullable (FK fee_payments — set after reconciliation)
matched_expense_id  — nullable (FK expenses)
is_reconciled       — boolean
reconciled_at
reconciled_by (FK users)
```

#### `mpesa_transactions` (from Safaricom C2B IPN)
```
school_id
mpesa_receipt_number  — unique (TransID from Safaricom)
transaction_type      — enum: c2b | stk_push
amount                — integer
phone_number          — encrypted
account_reference     — what the customer typed (usually ADM number)
transaction_date
matched_invoice_id    — nullable
matched_payment_id    — nullable
is_matched            — boolean
raw_payload           — JSON (full Safaricom callback)
```

#### `cheques`
```
school_id
cheque_number
bank_account_id (FK bank_accounts — school's account receiving cheque)
drawn_on_bank     — "Equity Bank"
amount            — integer
payer_name
received_date
deposit_date      — nullable
cleared_date      — nullable
status            — enum: received | deposited | cleared | bounced | cancelled
linked_payment_id (FK fee_payments)
bounce_reason     — nullable
bounce_charges    — integer nullable
```

### 3.2 M-Pesa Integration

**`app/Services/Finance/MpesaService.php`**
- `stkPush(phone, amount, account_ref, description)` — Lipa Na M-Pesa Online
- `handleC2BCallback(payload)` — receives Safaricom IPN, stores in `mpesa_transactions`, auto-matches to invoice by account_reference (ADM number), creates `fee_payment` if matched
- `handleStkCallback(payload)` — confirms or fails STK payment
- `queryTransaction(mpesa_code)` — query transaction status

**Safaricom callback routes (outside auth middleware):**
```php
Route::post('mpesa/c2b/validation',  [MpesaController::class, 'c2bValidate']);
Route::post('mpesa/c2b/confirmation',[MpesaController::class, 'c2bConfirm']);
Route::post('mpesa/stk/callback',    [MpesaController::class, 'stkCallback']);
```

**Auto-matching logic:**
1. Receive C2B callback with `AccountReference` = student ADM number
2. Look up student by ADM in the school (identified by paybill shortcode → school)
3. Find oldest unpaid/partial invoice for that student in current term
4. Create `fee_payment` linked to that invoice
5. Generate receipt, SMS parent

### 3.3 Bank Reconciliation

`BankReconciliationService::reconcile(bank_account_id, date_range)`
- Import statement CSV or manual entries
- Match bank statement lines to `fee_payments` / `expenses` by amount + date window
- Flag unmatched items for manual review
- Generate reconciliation report: Opening Balance → Receipts → Payments → Closing Balance

---

## Phase 4 — Financial Reports & Analytics
**Scope:** All financial reports, dashboards, exports

### 4.1 Reports Implemented

| Report | Description | Output |
|--------|-------------|--------|
| **Daily Collection Report** | Cash/M-Pesa/bank receipts by cashier | Screen + PDF + CSV |
| **Receipts Register** | All receipts in date range | Screen + CSV |
| **Outstanding Balances** | Per-student, per-class, per-grade | Screen + CSV |
| **Defaulters List** | Students with balance > threshold | Screen + CSV + SMS |
| **Fee Collection Summary** | By payment method, by class, by term | Screen + PDF |
| **Income Statement** | Fee income vs expenses by period | PDF |
| **Budget vs Actual** | Per category, per term | Screen + PDF |
| **Bank Reconciliation Statement** | Bank balance vs book balance | PDF |
| **Petty Cash Report** | Daily/monthly petty cash movement | PDF |
| **M-Pesa Transaction Report** | All M-Pesa receipts with match status | CSV |
| **Expense Ledger** | All expenses by category and period | Screen + PDF + CSV |
| **Student Financial Statement** | Full ledger for one student | PDF (send to parent) |
| **Arrears Ageing Analysis** | 30/60/90/120+ days overdue | Screen + PDF |
| **Annual Finance Report** | Full-year income, expenditure, surplus | PDF |

### 4.2 Database Migrations

#### `financial_reports` (saved/cached reports)
```
school_id
report_type
parameters      — JSON (date range, term, class_id, etc.)
generated_by (FK users)
generated_at
file_path       — cached PDF path
```

### 4.3 Routes

```php
Route::prefix('finance/reports')->group(function() {
    Route::get('daily-collection',        [FinanceReportController::class, 'dailyCollection']);
    Route::get('receipts-register',       [FinanceReportController::class, 'receiptsRegister']);
    Route::get('outstanding-balances',    [FinanceReportController::class, 'outstandingBalances']);
    Route::get('defaulters',              [FinanceReportController::class, 'defaulters']);
    Route::get('collection-summary',      [FinanceReportController::class, 'collectionSummary']);
    Route::get('income-statement',        [FinanceReportController::class, 'incomeStatement']);
    Route::get('budget-vs-actual',        [FinanceReportController::class, 'budgetVsActual']);
    Route::get('bank-reconciliation',     [FinanceReportController::class, 'bankReconciliation']);
    Route::get('petty-cash',              [FinanceReportController::class, 'pettyCash']);
    Route::get('mpesa-transactions',      [FinanceReportController::class, 'mpesaTransactions']);
    Route::get('expense-ledger',          [FinanceReportController::class, 'expenseLedger']);
    Route::get('student-statement/{id}',  [FinanceReportController::class, 'studentStatement']);
    Route::get('arrears-ageing',          [FinanceReportController::class, 'arrearsAgeing']);
    Route::get('annual-summary',          [FinanceReportController::class, 'annualSummary']);
    // Exports
    Route::get('{type}/export',           [FinanceReportController::class, 'export']);
    Route::get('{type}/pdf',              [FinanceReportController::class, 'pdf']);
});
```

---

## Phase 5 — Transport Billing, Boarding & Extras
**Scope:** Transport fees, boarding fees, optional extras, end-of-term clearance

### 5.1 Transport Billing
- Each student on a route gets `transport_fee_per_term` charged automatically at invoice issue
- Fee derived from `transport_routes.fee_per_term`
- Invoice item tagged with `type = transport`
- Removal from route removes from next term's invoice (not current)

### 5.2 Boarding / Dorm Billing
- `dormitory_allocations.fee_per_term` — set per dorm
- Auto-charged as invoice line item when student is allocated to a dorm
- Includes optional laundry, meals supplements

### 5.3 Student Groups / Fee Buckets
- `student_groups` — group students who share a fee structure (e.g. "Form 4 Boarders", "Grade 6 Day Scholars")
- Bulk-assign group → auto-apply correct fee structure at invoice time

### 5.4 End-of-Term Clearance
- Generate clearance status per student: library fines, outstanding fees, dorm damages, exam card eligibility
- Block exam card generation if balance > configured threshold
- `student_clearance` table:
  ```
  school_id, student_id, academic_year, term
  fee_cleared (boolean), library_cleared, dorm_cleared
  exam_card_issued, clearance_signed_off_by
  ```

---

## Phase 6 — QuickBooks / Xero Sync (Optional)
**Scope:** Export to accounting software for schools that use external bookkeeping

### 6.1 QuickBooks Online Integration
- OAuth2 flow per school (school-level credentials stored encrypted)
- `TransactionSyncService::syncToQuickBooks(school_id, date_range)`
  - Map `fee_payments` → QBO Sales Receipts
  - Map `expenses` → QBO Bills / Expenses
  - Map `fund_transfers` → QBO Journal Entries
- Sync log table: `qbo_sync_logs`
- Conflict resolution: Skullu is master of truth; QBO is read-only mirror

### 6.2 CSV Export (always available)
- Any table exportable to HMRC/KRA-compatible CSV
- Format configurable per school

---

## Implementation Order (Build Sequence)

```
Phase 1A  Migrations: fee_structure_items, student_fee_invoices,
          student_invoice_items, fee_payments, fee_receipts
Phase 1B  FeeService + ReceiptNumberService
Phase 1C  InvoiceController + PaymentController + ReceiptController
Phase 1D  Connect FeeList, RecordPayment, FeeInvoices, ReceiptsRegister,
          DefaultersList, DailyCollection UI components to real API
─────────────────────────────────────────────────────────
Phase 2A  Migrations: expense_categories, expenses,
          petty_cash_accounts, petty_cash_transactions, fund_transfer_requests
Phase 2B  ExpenseController + PettyCashController + FundTransferController
Phase 2C  Connect ExpenseManager, FundTransfers, Expenditure UI
─────────────────────────────────────────────────────────
Phase 3A  Migrations: bank_accounts, bank_statements, mpesa_transactions, cheques
Phase 3B  MpesaService (STK Push + C2B callbacks)
Phase 3C  BankReconciliationService
Phase 3D  Connect BankReconciliation, ChequeClearance, TransactionSync UI
─────────────────────────────────────────────────────────
Phase 4A  FinanceReportController (all reports)
Phase 4B  PDF generation using Laravel DomPDF or Snappy
Phase 4C  Connect FinancialReports UI; add export buttons
─────────────────────────────────────────────────────────
Phase 5A  Transport/Dorm billing auto-charge on invoice issue
Phase 5B  Student groups + bulk invoice issue
Phase 5C  End-of-term clearance system
─────────────────────────────────────────────────────────
Phase 6   QuickBooks/Xero sync (optional, per-school toggle)
```

---

## Multi-Tenancy Rules (Non-Negotiable)

Every single query in every Finance controller/service MUST:

```php
// ✅ Correct — always scope to current school
FeePayment::where('school_id', $schoolId)->...

// ✅ Using BelongsToTenant scope (auto-applied via trait)
FeePayment::query()->...   // scope fires automatically

// ❌ WRONG — never do this
FeePayment::all()
FeePayment::find($id)   // always add ->where('school_id', $schoolId)
```

Receipt numbers are sequential **per school**, not global:
```
KASEE-RCT-2026-00142   ← Kasee Academy
NAIROBI-RCT-2026-00001 ← Nairobi Primary (different sequence)
```

---

## Data Accuracy Safeguards

| Risk | Safeguard |
|------|-----------|
| Double-entry on payment | Unique constraint on `receipt_number`; DB transaction wraps payment + invoice update |
| Invoice total mismatch | `total_paid` updated via DB transaction; `balance` = `total_charged - total_paid - discounts + surcharges` |
| Concurrent payments | `SELECT FOR UPDATE` lock on invoice row before updating |
| M-Pesa duplicate callback | Unique constraint on `mpesa_receipt_number`; idempotent callback handler |
| Deleted student leaves orphan balance | `student_id` FK with `RESTRICT` on delete |
| Rounding errors | All amounts stored as integers (Kenya shillings, no subunit needed) |
| Backdated payments | `payment_date` allowed to be past; `created_at` captures actual entry time; both stored |
| Cheque bouncing after receipt issued | Bounced cheque creates reversal record; receipt marked `REVERSED`; parent SMS alert |
| Unauthorised expense | Approval workflow — `pending_approval` → accountant approves → `approved` → principal countersigns if > KES 50,000 |

---

## Roles & Permissions Matrix (Finance)

| Action | Cashier | Accountant | School Admin | Principal |
|--------|---------|-----------|-------------|-----------|
| Record payment | ✅ | ✅ | ✅ | — |
| Issue invoice | — | ✅ | ✅ | — |
| Bulk issue invoices | — | ✅ | ✅ | — |
| Reverse payment | — | ✅ | ✅ | — |
| Approve expense < 50k | — | ✅ | ✅ | — |
| Approve expense ≥ 50k | — | — | — | ✅ |
| Apply discount | — | ✅ | ✅ | — |
| View all reports | — | ✅ | ✅ | ✅ |
| Export data | — | ✅ | ✅ | — |
| Configure fee structures | — | — | ✅ | — |
| Bank reconciliation | — | ✅ | ✅ | — |
| QuickBooks sync | — | ✅ | ✅ | — |

---

## Key Files to Create (Phase 1 target)

```
app/
  Services/Finance/
    FeeService.php
    ReceiptNumberService.php
    MpesaService.php              (Phase 3)
    BankReconciliationService.php (Phase 3)

  Http/Controllers/Accountant/
    InvoiceController.php
    PaymentController.php
    ReceiptController.php
    FeeStructureController.php
    DefaulterController.php
    DiscountController.php
    SponsorshipController.php
    SurchargeController.php
    DailyCollectionController.php
    ReceiptsRegisterController.php
    ExpenseController.php         (Phase 2)
    PettyCashController.php       (Phase 2)
    FundTransferController.php    (Phase 2)
    BankAccountController.php     (Phase 3)
    BankReconciliationController.php (Phase 3)
    MpesaController.php           (Phase 3)
    FinanceReportController.php   (Phase 4)

  Models/
    FeeStructureItem.php
    StudentFeeInvoice.php
    StudentInvoiceItem.php
    FeePayment.php                (replaces StudentFeePayment)
    FeeReceipt.php
    StudentDiscount.php
    Sponsorship.php
    Surcharge.php
    ExpenseCategory.php
    Expense.php
    PettyCashAccount.php
    PettyCashTransaction.php
    FundTransferRequest.php
    BankAccount.php               (Phase 3)
    BankStatement.php             (Phase 3)
    MpesaTransaction.php          (Phase 3)
    Cheque.php                    (Phase 3)
    StudentClearance.php          (Phase 5)

database/migrations/
  [phase 1 migrations]
  [phase 2 migrations]
  [phase 3 migrations]
  [phase 4 migrations]
  [phase 5 migrations]
```

---

## Accountant Dashboard KPIs (real-time)

Connect `AccountantDashboard.js` to:
```
GET /api/finance/dashboard/summary

Response:
{
  today_collection: { cash, mpesa, bank, cheque, total },
  this_term:        { invoiced, collected, outstanding, discounts },
  defaulters_count: 42,
  unmatched_mpesa:  3,
  pending_expenses: 5,
  bank_accounts: [{ name, balance, as_of }]
}
```

---

*Plan version: 1.0 — April 2026*
*Covers: Skullu 2.0 multi-tenant SaaS — Kenya primary + secondary schools*
*Next action: Begin Phase 1A migrations*
