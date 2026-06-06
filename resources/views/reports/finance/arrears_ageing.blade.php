<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>Arrears Ageing Analysis</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a202c; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #702459; padding-bottom: 10px; margin-bottom: 16px; }
  .school-name { font-size: 16px; font-weight: bold; color: #702459; }
  .report-title { font-size: 13px; font-weight: bold; color: #2d3748; margin-top: 4px; }
  .meta { font-size: 9px; color: #718096; margin-top: 2px; }
  .bucket-legend { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
  .bucket-tag { padding: 5px 10px; border-radius: 4px; font-size: 9px; font-weight: bold; text-align: center; }
  .b-current { background: #e9d8fd; color: #44337a; }
  .b-30  { background: #fefcbf; color: #744210; }
  .b-60  { background: #feebc8; color: #7b341e; }
  .b-90  { background: #fed7d7; color: #822727; }
  .b-120 { background: #c53030; color: white; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  thead th { background: #702459; color: white; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: bold; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  .num { text-align: right; font-family: monospace; }
  h3 { font-size: 11px; color: #2d3748; background: #f7fafc; border: 1px solid #e2e8f0; padding: 5px 8px; margin: 10px 0 0; border-radius: 4px 4px 0 0; }
  .footer { margin-top: 20px; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 6px; }
</style>
</head>
<body>
<div class="header">
  <div class="school-name">{{ $school->name ?? 'School' }}</div>
  <div class="report-title">Arrears Ageing Analysis</div>
  <div class="meta">As of: {{ $data['as_of'] ?? $date }} &nbsp;|&nbsp; Generated: {{ $date }}</div>
</div>

@php
  $buckets = $data['buckets'] ?? [];
  $summary = $data['summary'] ?? [];
  $total   = $data['total'] ?? [];
  $bucketLabels = ['current' => 'Current (≤0 days)', '30' => '1-30 days', '60' => '31-60 days', '90' => '61-90 days', '120' => '91+ days'];
  $bucketCls   = ['current' => 'b-current', '30' => 'b-30', '60' => 'b-60', '90' => 'b-90', '120' => 'b-120'];
@endphp

<div class="bucket-legend">
  @foreach ($bucketLabels as $key => $label)
  @php $s = is_array($summary[$key] ?? []) ? ($summary[$key] ?? []) : []; @endphp
  <div class="bucket-tag {{ $bucketCls[$key] }}">
    {{ $label }}<br>
    {{ $s['count'] ?? 0 }} students &mdash; KES {{ number_format(($s['amount'] ?? 0) / 100, 2) }}
  </div>
  @endforeach
</div>

@foreach ($buckets as $key => $rows)
@if (!empty($rows))
<h3>{{ $bucketLabels[$key] ?? $key }} ({{ count($rows) }} invoices)</h3>
<table>
  <thead><tr><th>Student</th><th>Adm No</th><th>Class</th><th>Invoice</th><th>Due Date</th><th class="num">Days Overdue</th><th class="num">Balance (KES)</th></tr></thead>
  <tbody>
    @foreach ($rows as $r)
    @php $r = (array) $r; @endphp
    <tr>
      <td>{{ ($r['first_name'] ?? '') . ' ' . ($r['last_name'] ?? '') }}</td>
      <td>{{ $r['admission_number'] ?? '—' }}</td>
      <td>{{ $r['class_name'] ?? '—' }}</td>
      <td>{{ $r['invoice_number'] ?? '—' }}</td>
      <td>{{ $r['due_date'] ?? '—' }}</td>
      <td class="num">{{ $r['days_overdue'] ?? 0 }}</td>
      <td class="num" style="color:#c53030; font-weight:bold;">{{ number_format(($r['balance_due'] ?? 0) / 100, 2) }}</td>
    </tr>
    @endforeach
  </tbody>
</table>
@endif
@endforeach

<p style="font-weight:bold; border-top: 2px solid #2d3748; padding-top:6px; margin-top:8px;">
  GRAND TOTAL: {{ $total['count'] ?? 0 }} invoices &mdash; KES {{ number_format(($total['amount'] ?? 0) / 100, 2) }}
</p>
<div class="footer">Ikonex Finance — {{ $school->name ?? '' }} &nbsp;|&nbsp; Printed: {{ $date }} &nbsp;|&nbsp; CONFIDENTIAL</div>
</body></html>
