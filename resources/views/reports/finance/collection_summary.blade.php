<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>Fee Collection Summary</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a202c; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #276749; padding-bottom: 10px; margin-bottom: 16px; }
  .school-name { font-size: 16px; font-weight: bold; color: #276749; }
  .report-title { font-size: 13px; font-weight: bold; color: #2d3748; margin-top: 4px; }
  .meta { font-size: 9px; color: #718096; margin-top: 2px; }
  .summary-grid { display: flex; gap: 10px; margin-bottom: 14px; }
  .sum-box { flex: 1; background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 4px; padding: 8px; text-align: center; }
  .sum-box .val { font-size: 13px; font-weight: bold; color: #276749; }
  .sum-box .lbl { font-size: 8px; color: #718096; text-transform: uppercase; }
  h3 { font-size: 11px; color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 14px 0 6px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  thead th { background: #276749; color: white; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: bold; text-transform: uppercase; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tbody tr:nth-child(even) { background: #f0fff4; }
  .num { text-align: right; font-family: monospace; }
  tfoot td { background: #2d3748; color: white; font-weight: bold; padding: 6px 8px; }
  .footer { margin-top: 20px; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 6px; }
</style>
</head>
<body>
<div class="header">
  <div class="school-name">{{ $school->name ?? 'School' }}</div>
  <div class="report-title">Fee Collection Summary</div>
  <div class="meta">Year: {{ $params['academic_year'] ?? '—' }} {{ isset($params['term']) ? ' Term: '.$params['term'] : '(All Terms)' }} &nbsp;|&nbsp; Generated: {{ $date }}</div>
</div>

@php
  $s   = $data['summary'] ?? [];
  $bm  = $data['by_method'] ?? [];
  $bc  = $data['by_class'] ?? [];
@endphp

<div class="summary-grid">
  <div class="sum-box"><div class="val">{{ $s['invoice_count'] ?? '—' }}</div><div class="lbl">Invoices</div></div>
  <div class="sum-box"><div class="val">KES {{ number_format(($s['total_billed'] ?? 0) / 100, 2) }}</div><div class="lbl">Total Billed</div></div>
  <div class="sum-box"><div class="val">KES {{ number_format(($s['total_collected'] ?? 0) / 100, 2) }}</div><div class="lbl">Collected</div></div>
  <div class="sum-box"><div class="val">KES {{ number_format(($s['total_outstanding'] ?? 0) / 100, 2) }}</div><div class="lbl">Outstanding</div></div>
</div>

<h3>By Payment Method</h3>
<table>
  <thead><tr><th>Method</th><th class="num">Count</th><th class="num">Amount (KES)</th></tr></thead>
  <tbody>
    @foreach ($bm as $m)
    @php $m = (array) $m; @endphp
    <tr><td>{{ ucwords(str_replace('_', ' ', $m['payment_method'] ?? '')) }}</td><td class="num">{{ $m['count'] ?? 0 }}</td><td class="num">{{ number_format(($m['amount'] ?? 0) / 100, 2) }}</td></tr>
    @endforeach
  </tbody>
</table>

<h3>By Class</h3>
<table>
  <thead><tr><th>Class</th><th class="num">Billed (KES)</th><th class="num">Collected (KES)</th><th class="num">Outstanding (KES)</th></tr></thead>
  <tbody>
    @foreach ($bc as $c)
    @php $c = (array) $c; @endphp
    <tr><td>{{ $c['class_name'] ?? '—' }}</td><td class="num">{{ number_format(($c['billed'] ?? 0) / 100, 2) }}</td><td class="num">{{ number_format(($c['collected'] ?? 0) / 100, 2) }}</td><td class="num">{{ number_format(($c['outstanding'] ?? 0) / 100, 2) }}</td></tr>
    @endforeach
  </tbody>
</table>

<div class="footer">Ikonex Finance — {{ $school->name ?? '' }} &nbsp;|&nbsp; Printed: {{ $date }}</div>
</body></html>
