<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>Bank Reconciliation Statement</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a202c; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #2b6cb0; padding-bottom: 10px; margin-bottom: 16px; }
  .school-name { font-size: 16px; font-weight: bold; color: #2b6cb0; }
  .report-title { font-size: 13px; font-weight: bold; color: #2d3748; margin-top: 4px; }
  .meta { font-size: 9px; color: #718096; margin-top: 2px; }
  .recon-box { background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 4px; padding: 12px; margin-bottom: 14px; }
  .recon-line { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #bee3f8; }
  .recon-total { font-weight: bold; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  thead th { background: #2b6cb0; color: white; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: bold; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tbody tr:nth-child(even) { background: #ebf8ff; }
  .num { text-align: right; font-family: monospace; }
  .matched { color: #276749; } .unmatched { color: #c53030; }
  .footer { margin-top: 20px; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 6px; }
</style>
</head>
<body>
<div class="header">
  <div class="school-name">{{ $school->name ?? 'School' }}</div>
  <div class="report-title">Bank Reconciliation Statement</div>
  <div class="meta">Period: {{ $params['from'] ?? '—' }} to {{ $params['to'] ?? '—' }} &nbsp;|&nbsp; Generated: {{ $date }}</div>
</div>

@php
  $account = $data['account'] ?? [];
  $s       = $data['summary'] ?? [];
  $stmts   = collect($data['statements'] ?? []);
@endphp

@if (!empty($account))
<p><strong>Account:</strong> {{ (array)$account['bank_name'] ?? '' }} — {{ (array)$account['account_name'] ?? '' }} ({{ (array)$account['account_number'] ?? '' }})</p>
@endif

<div class="recon-box">
  <div class="recon-line"><span>Opening Balance</span><span>KES {{ number_format(($s['opening_balance'] ?? 0) / 100, 2) }}</span></div>
  <div class="recon-line"><span>+ Total Credits (Deposits)</span><span>KES {{ number_format(($s['total_credits'] ?? 0) / 100, 2) }}</span></div>
  <div class="recon-line"><span>- Total Debits (Withdrawals)</span><span>KES {{ number_format(($s['total_debits'] ?? 0) / 100, 2) }}</span></div>
  <div class="recon-line recon-total"><span>Closing Balance</span><span>KES {{ number_format(($s['closing_balance'] ?? 0) / 100, 2) }}</span></div>
  <div class="recon-line"><span>Reconciled Items</span><span>{{ $s['reconciled_count'] ?? 0 }}</span></div>
  <div class="recon-line" style="color:#c53030"><span>Unmatched Items</span><span>{{ $s['unmatched_count'] ?? 0 }}</span></div>
</div>

<table>
  <thead><tr><th>Date</th><th>Description</th><th>Reference</th><th class="num">Credit</th><th class="num">Debit</th><th class="num">Balance</th><th>Status</th></tr></thead>
  <tbody>
    @foreach ($stmts as $r)
    @php $r = (array) $r; @endphp
    <tr>
      <td>{{ $r['transaction_date'] ?? '—' }}</td>
      <td>{{ $r['description'] ?? '—' }}</td>
      <td>{{ $r['reference'] ?? '—' }}</td>
      <td class="num">{{ $r['credit'] ? number_format($r['credit'] / 100, 2) : '—' }}</td>
      <td class="num">{{ $r['debit'] ? number_format($r['debit'] / 100, 2) : '—' }}</td>
      <td class="num">{{ number_format(($r['running_balance'] ?? 0) / 100, 2) }}</td>
      <td class="{{ $r['is_reconciled'] ? 'matched' : 'unmatched' }}">{{ $r['is_reconciled'] ? '✓ Matched' : 'Pending' }}</td>
    </tr>
    @endforeach
  </tbody>
</table>
<div class="footer">Skullu Finance — {{ $school->name ?? '' }} &nbsp;|&nbsp; Printed: {{ $date }}</div>
</body></html>
