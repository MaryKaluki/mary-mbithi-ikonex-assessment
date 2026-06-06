<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>Income Statement</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a202c; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #2b6cb0; padding-bottom: 10px; margin-bottom: 16px; }
  .school-name { font-size: 16px; font-weight: bold; color: #2b6cb0; }
  .report-title { font-size: 13px; font-weight: bold; color: #2d3748; margin-top: 4px; }
  .meta { font-size: 9px; color: #718096; margin-top: 2px; }
  .surplus-box { text-align: center; margin: 14px 0; padding: 12px; border-radius: 6px; }
  .surplus-pos { background: #f0fff4; border: 2px solid #9ae6b4; }
  .surplus-neg { background: #fff5f5; border: 2px solid #feb2b2; }
  .surplus-val { font-size: 20px; font-weight: bold; }
  .surplus-lbl { font-size: 9px; color: #718096; text-transform: uppercase; }
  .two-col { display: flex; gap: 16px; }
  .col { flex: 1; }
  h3 { font-size: 11px; color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 10px 0 6px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #2b6cb0; color: white; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: bold; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  .num { text-align: right; font-family: monospace; }
  tfoot td { background: #2d3748; color: white; font-weight: bold; padding: 5px 8px; }
  .footer { margin-top: 20px; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 6px; }
</style>
</head>
<body>
<div class="header">
  <div class="school-name">{{ $school->name ?? 'School' }}</div>
  <div class="report-title">Income Statement</div>
  <div class="meta">Period: {{ $data['period']['from'] ?? '—' }} to {{ $data['period']['to'] ?? '—' }} &nbsp;|&nbsp; Generated: {{ $date }}</div>
</div>

@php
  $income   = $data['total_income'] ?? 0;
  $expenses = $data['total_expenses'] ?? 0;
  $surplus  = $data['net_surplus'] ?? ($income - $expenses);
  $cats     = collect($data['expense_by_category'] ?? []);
@endphp

<div class="two-col">
  <div class="col">
    <h3>Income</h3>
    <table>
      <tbody>
        <tr><td>Fee Receipts ({{ $data['income_count'] ?? '—' }} transactions)</td><td class="num">KES {{ number_format($income / 100, 2) }}</td></tr>
      </tbody>
      <tfoot><tr><td>TOTAL INCOME</td><td class="num">{{ number_format($income / 100, 2) }}</td></tr></tfoot>
    </table>
  </div>
  <div class="col">
    <h3>Expenditure by Category</h3>
    <table>
      <thead><tr><th>Category</th><th class="num">Amount (KES)</th></tr></thead>
      <tbody>
        @foreach ($cats as $c)
        @php $c = (array) $c; @endphp
        <tr><td>{{ $c['category'] ?? '—' }}</td><td class="num">{{ number_format(($c['amount'] ?? 0) / 100, 2) }}</td></tr>
        @endforeach
      </tbody>
      <tfoot><tr><td>TOTAL EXPENSES</td><td class="num">{{ number_format($expenses / 100, 2) }}</td></tr></tfoot>
    </table>
  </div>
</div>

<div class="surplus-box {{ $surplus >= 0 ? 'surplus-pos' : 'surplus-neg' }}">
  <div class="surplus-val" style="color: {{ $surplus >= 0 ? '#276749' : '#c53030' }}">
    KES {{ number_format(abs($surplus) / 100, 2) }}
  </div>
  <div class="surplus-lbl">{{ $surplus >= 0 ? 'Net Surplus' : 'Net Deficit' }}</div>
</div>

<div class="footer">Skullu Finance — {{ $school->name ?? '' }} &nbsp;|&nbsp; Printed: {{ $date }}</div>
</body></html>
