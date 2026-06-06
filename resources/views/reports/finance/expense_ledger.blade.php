<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>Expense Ledger</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a202c; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #c53030; padding-bottom: 10px; margin-bottom: 16px; }
  .school-name { font-size: 16px; font-weight: bold; color: #c53030; }
  .report-title { font-size: 13px; font-weight: bold; color: #2d3748; margin-top: 4px; }
  .meta { font-size: 9px; color: #718096; margin-top: 2px; }
  .sum-bar { background: #fff5f5; border: 1px solid #feb2b2; border-radius: 4px; padding: 8px 14px; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #c53030; color: white; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: bold; text-transform: uppercase; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tbody tr:nth-child(even) { background: #fff5f5; }
  .num { text-align: right; font-family: monospace; }
  .status-approved { color: #276749; font-weight: bold; }
  .status-paid { color: #2b6cb0; font-weight: bold; }
  .status-pending_approval { color: #c05621; }
  .status-rejected { color: #c53030; }
  tfoot td { background: #2d3748; color: white; font-weight: bold; padding: 6px 8px; }
  .footer { margin-top: 20px; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 6px; }
</style>
</head>
<body>
<div class="header">
  <div class="school-name">{{ $school->name ?? 'School' }}</div>
  <div class="report-title">Expense Ledger</div>
  <div class="meta">Period: {{ $data['period']['from'] ?? '—' }} to {{ $data['period']['to'] ?? '—' }} &nbsp;|&nbsp; Generated: {{ $date }}</div>
</div>

@php $s = $data['summary'] ?? []; $rows = collect($data['data'] ?? []); @endphp

<div class="sum-bar">
  <strong>{{ $s['count'] ?? $rows->count() }}</strong> expenses &nbsp;&mdash;&nbsp;
  Total: <strong>KES {{ number_format(($s['amount'] ?? $rows->sum('amount')) / 100, 2) }}</strong>
</div>

<table>
  <thead>
    <tr><th>#</th><th>Expense No</th><th>Date</th><th>Category</th><th>Description</th><th>Method</th><th>Submitted By</th><th class="num">Amount (KES)</th><th>Status</th></tr>
  </thead>
  <tbody>
    @foreach ($rows as $i => $r)
    @php $r = (array) $r; @endphp
    <tr>
      <td>{{ $i + 1 }}</td>
      <td style="font-family:monospace">{{ $r['expense_number'] ?? '—' }}</td>
      <td>{{ $r['expense_date'] ?? '—' }}</td>
      <td>{{ $r['category_name'] ?? 'Uncategorised' }}</td>
      <td>{{ $r['description'] ?? '—' }}</td>
      <td>{{ ucwords(str_replace('_', ' ', $r['payment_method'] ?? '—')) }}</td>
      <td>{{ $r['submitted_by_name'] ?? '—' }}</td>
      <td class="num">{{ number_format(($r['amount'] ?? 0) / 100, 2) }}</td>
      <td class="status-{{ str_replace(' ', '_', $r['status'] ?? '') }}">{{ ucwords(str_replace('_', ' ', $r['status'] ?? '—')) }}</td>
    </tr>
    @endforeach
  </tbody>
  <tfoot>
    <tr><td colspan="7">TOTAL</td><td class="num">{{ number_format(($s['amount'] ?? $rows->sum('amount')) / 100, 2) }}</td><td></td></tr>
  </tfoot>
</table>
<div class="footer">Ikonex Finance — {{ $school->name ?? '' }} &nbsp;|&nbsp; Printed: {{ $date }}</div>
</body></html>
