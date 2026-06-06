<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>Petty Cash Report</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a202c; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #744210; padding-bottom: 10px; margin-bottom: 16px; }
  .school-name { font-size: 16px; font-weight: bold; color: #744210; }
  .report-title { font-size: 13px; font-weight: bold; color: #2d3748; margin-top: 4px; }
  .meta { font-size: 9px; color: #718096; margin-top: 2px; }
  .sum-row { display: flex; gap: 10px; margin-bottom: 14px; }
  .sum-box { flex: 1; border: 1px solid #fbd38d; background: #fffff0; border-radius: 4px; padding: 8px; text-align: center; }
  .sum-box .val { font-size: 13px; font-weight: bold; color: #744210; }
  .sum-box .lbl { font-size: 8px; color: #718096; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #744210; color: white; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: bold; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tbody tr:nth-child(even) { background: #fffff0; }
  .num { text-align: right; font-family: monospace; }
  .top_up { color: #276749; } .expense { color: #c53030; } .reimbursement { color: #2b6cb0; }
  .footer { margin-top: 20px; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 6px; }
</style>
</head>
<body>
<div class="header">
  <div class="school-name">{{ $school->name ?? 'School' }}</div>
  <div class="report-title">Petty Cash Report</div>
  <div class="meta">Period: {{ $data['period']['from'] ?? '—' }} to {{ $data['period']['to'] ?? '—' }} &nbsp;|&nbsp; Generated: {{ $date }}</div>
</div>

@php
  $s    = $data['summary'] ?? [];
  $txns = collect($data['transactions'] ?? []);
@endphp

<div class="sum-row">
  <div class="sum-box"><div class="val" style="color:#276749">KES {{ number_format(($s['top_ups'] ?? 0) / 100, 2) }}</div><div class="lbl">Top-ups</div></div>
  <div class="sum-box"><div class="val" style="color:#c53030">KES {{ number_format(($s['expenses'] ?? 0) / 100, 2) }}</div><div class="lbl">Expenses</div></div>
  <div class="sum-box"><div class="val" style="color:#2b6cb0">KES {{ number_format(($s['reimbursements'] ?? 0) / 100, 2) }}</div><div class="lbl">Reimbursements</div></div>
  <div class="sum-box"><div class="val">KES {{ number_format(($s['net_movement'] ?? 0) / 100, 2) }}</div><div class="lbl">Net Movement</div></div>
</div>

<table>
  <thead><tr><th>Date</th><th>Account</th><th>Type</th><th>Description</th><th>Reference</th><th>Recorded By</th><th class="num">Amount (KES)</th></tr></thead>
  <tbody>
    @foreach ($txns as $r)
    @php $r = (array) $r; @endphp
    <tr>
      <td>{{ $r['transaction_date'] ?? '—' }}</td>
      <td>{{ $r['account_name'] ?? '—' }}</td>
      <td class="{{ $r['type'] ?? '' }}">{{ ucwords(str_replace('_', ' ', $r['type'] ?? '—')) }}</td>
      <td>{{ $r['description'] ?? '—' }}</td>
      <td>{{ $r['reference'] ?? '—' }}</td>
      <td>{{ $r['recorded_by_name'] ?? '—' }}</td>
      <td class="num">{{ number_format(($r['amount'] ?? 0) / 100, 2) }}</td>
    </tr>
    @endforeach
  </tbody>
</table>
<div class="footer">Ikonex Finance — {{ $school->name ?? '' }} &nbsp;|&nbsp; Printed: {{ $date }}</div>
</body></html>
