<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>Annual Finance Report {{ $data['year'] ?? '' }}</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a202c; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 3px solid #1a365d; padding-bottom: 12px; margin-bottom: 18px; }
  .school-name { font-size: 18px; font-weight: bold; color: #1a365d; }
  .report-title { font-size: 14px; font-weight: bold; color: #2d3748; margin-top: 4px; }
  .year-badge { display: inline-block; background: #1a365d; color: white; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 6px; }
  .meta { font-size: 9px; color: #718096; margin-top: 4px; }
  .kpi-row { display: flex; gap: 12px; margin-bottom: 20px; margin-top: 10px; }
  .kpi { flex: 1; border-radius: 6px; padding: 12px; text-align: center; }
  .kpi-income { background: #f0fff4; border: 2px solid #9ae6b4; }
  .kpi-expense { background: #fff5f5; border: 2px solid #feb2b2; }
  .kpi-surplus { background: #ebf8ff; border: 2px solid #bee3f8; }
  .kpi .val { font-size: 15px; font-weight: bold; }
  .kpi .lbl { font-size: 8px; color: #718096; text-transform: uppercase; margin-top: 3px; }
  h3 { font-size: 11px; color: #1a365d; border-bottom: 2px solid #bee3f8; padding-bottom: 4px; margin: 16px 0 8px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #1a365d; color: white; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: bold; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tbody tr:nth-child(even) { background: #f7fafc; }
  .num { text-align: right; font-family: monospace; }
  .surplus-pos { color: #276749; font-weight: bold; }
  .surplus-neg { color: #c53030; font-weight: bold; }
  tfoot td { background: #2d3748; color: white; font-weight: bold; padding: 6px 8px; }
  .footer { margin-top: 24px; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 6px; }
</style>
</head>
<body>
<div class="header">
  <div class="school-name">{{ $school->name ?? 'School' }}</div>
  <div class="report-title">Annual Finance Report</div>
  <div class="year-badge">{{ $data['year'] ?? date('Y') }}</div>
  <div class="meta">Generated: {{ $date }}</div>
</div>

@php
  $totals = $data['totals'] ?? [];
  $months = collect($data['monthly_series'] ?? []);
  $byTerm = collect($data['by_term'] ?? []);
@endphp

<div class="kpi-row">
  <div class="kpi kpi-income"><div class="val" style="color:#276749">KES {{ number_format(($totals['income'] ?? 0) / 100, 2) }}</div><div class="lbl">Total Income</div></div>
  <div class="kpi kpi-expense"><div class="val" style="color:#c53030">KES {{ number_format(($totals['expenses'] ?? 0) / 100, 2) }}</div><div class="lbl">Total Expenses</div></div>
  <div class="kpi kpi-surplus"><div class="val {{ ($totals['surplus'] ?? 0) >= 0 ? 'surplus-pos' : 'surplus-neg' }}">KES {{ number_format(abs($totals['surplus'] ?? 0) / 100, 2) }}</div><div class="lbl">{{ ($totals['surplus'] ?? 0) >= 0 ? 'Net Surplus' : 'Net Deficit' }}</div></div>
</div>

<h3>Per-Term Summary</h3>
<table>
  <thead><tr><th>Term</th><th class="num">Income (KES)</th><th class="num">Expenses (KES)</th><th class="num">Surplus (KES)</th></tr></thead>
  <tbody>
    @foreach ($byTerm as $t)
    @php $t = (array) $t; $s = ($t['income'] ?? 0) - ($t['expenses'] ?? 0); @endphp
    <tr>
      <td>Term {{ $t['term'] ?? '—' }}</td>
      <td class="num">{{ number_format(($t['income'] ?? 0) / 100, 2) }}</td>
      <td class="num">{{ number_format(($t['expenses'] ?? 0) / 100, 2) }}</td>
      <td class="num {{ $s >= 0 ? 'surplus-pos' : 'surplus-neg' }}">{{ number_format(abs($s) / 100, 2) }}</td>
    </tr>
    @endforeach
  </tbody>
</table>

<h3>Monthly Breakdown</h3>
<table>
  <thead><tr><th>Month</th><th class="num">Income (KES)</th><th class="num">Expenses (KES)</th><th class="num">Surplus (KES)</th><th class="num">Transactions</th></tr></thead>
  <tbody>
    @foreach ($months as $m)
    @php $m = (array) $m; $s = ($m['income'] ?? 0) - ($m['expenses'] ?? 0); @endphp
    <tr>
      <td>{{ $m['month'] ?? '—' }}</td>
      <td class="num">{{ number_format(($m['income'] ?? 0) / 100, 2) }}</td>
      <td class="num">{{ number_format(($m['expenses'] ?? 0) / 100, 2) }}</td>
      <td class="num {{ $s >= 0 ? 'surplus-pos' : 'surplus-neg' }}">{{ number_format(abs($s) / 100, 2) }}</td>
      <td class="num">{{ $m['transactions'] ?? 0 }}</td>
    </tr>
    @endforeach
  </tbody>
  <tfoot>
    <tr>
      <td>YEAR TOTAL</td>
      <td class="num">{{ number_format(($totals['income'] ?? 0) / 100, 2) }}</td>
      <td class="num">{{ number_format(($totals['expenses'] ?? 0) / 100, 2) }}</td>
      <td class="num">{{ number_format(($totals['surplus'] ?? 0) / 100, 2) }}</td>
      <td class="num">{{ $months->sum('transactions') }}</td>
    </tr>
  </tfoot>
</table>

<div class="footer">Ikonex Finance — {{ $school->name ?? '' }} &nbsp;|&nbsp; Annual Report {{ $data['year'] ?? '' }} &nbsp;|&nbsp; Printed: {{ $date }} &nbsp;|&nbsp; CONFIDENTIAL</div>
</body></html>
