<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>Outstanding Balances</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a202c; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #744210; padding-bottom: 10px; margin-bottom: 16px; }
  .school-name { font-size: 16px; font-weight: bold; color: #744210; }
  .report-title { font-size: 13px; font-weight: bold; color: #2d3748; margin-top: 4px; }
  .meta { font-size: 9px; color: #718096; margin-top: 2px; }
  .summary-row { display: flex; gap: 12px; margin-bottom: 14px; }
  .sum-box { flex: 1; background: #fffaf0; border: 1px solid #fbd38d; border-radius: 4px; padding: 8px; text-align: center; }
  .sum-box .val { font-size: 13px; font-weight: bold; color: #c05621; }
  .sum-box .lbl { font-size: 8px; color: #718096; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #c05621; color: white; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: bold; text-transform: uppercase; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tbody tr:nth-child(even) { background: #fffaf0; }
  .num { text-align: right; font-family: monospace; }
  tfoot td { background: #2d3748; color: white; font-weight: bold; padding: 6px 8px; }
  .footer { margin-top: 20px; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 6px; }
</style>
</head>
<body>
<div class="header">
  <div class="school-name">{{ $school->name ?? 'School' }}</div>
  <div class="report-title">Outstanding Balances Report</div>
  <div class="meta">{{ isset($params['academic_year']) ? 'Year: '.$params['academic_year'] : '' }} {{ isset($params['term']) ? ' Term: '.$params['term'] : '' }} &nbsp;|&nbsp; Generated: {{ $date }}</div>
</div>

@php
  $rows = collect($data['data'] ?? []);
  $summary = $data['summary'] ?? [];
@endphp

<div class="summary-row">
  <div class="sum-box"><div class="val">{{ $summary['student_count'] ?? $rows->count() }}</div><div class="lbl">Students</div></div>
  <div class="sum-box"><div class="val">KES {{ number_format(($summary['total_invoiced'] ?? $rows->sum('total_invoiced')) / 100, 2) }}</div><div class="lbl">Invoiced</div></div>
  <div class="sum-box"><div class="val">KES {{ number_format(($summary['total_collected'] ?? $rows->sum('total_paid')) / 100, 2) }}</div><div class="lbl">Collected</div></div>
  <div class="sum-box"><div class="val">KES {{ number_format(($summary['total_balance'] ?? $rows->sum('balance_due')) / 100, 2) }}</div><div class="lbl">Outstanding</div></div>
</div>

<table>
  <thead>
    <tr><th>#</th><th>Student</th><th>Adm No</th><th>Class</th><th class="num">Invoiced (KES)</th><th class="num">Paid (KES)</th><th class="num">Balance (KES)</th></tr>
  </thead>
  <tbody>
    @foreach ($rows as $i => $r)
    @php $r = (array) $r; @endphp
    <tr>
      <td>{{ $i + 1 }}</td>
      <td>{{ ($r['first_name'] ?? '') . ' ' . ($r['last_name'] ?? '') }}</td>
      <td>{{ $r['admission_number'] ?? '—' }}</td>
      <td>{{ $r['class_name'] ?? '—' }}</td>
      <td class="num">{{ number_format(($r['total_invoiced'] ?? 0) / 100, 2) }}</td>
      <td class="num">{{ number_format(($r['total_paid'] ?? 0) / 100, 2) }}</td>
      <td class="num" style="color:#c05621; font-weight:bold;">{{ number_format(($r['balance_due'] ?? 0) / 100, 2) }}</td>
    </tr>
    @endforeach
  </tbody>
  <tfoot>
    <tr>
      <td colspan="4">TOTAL</td>
      <td class="num">{{ number_format(($summary['total_invoiced'] ?? $rows->sum('total_invoiced')) / 100, 2) }}</td>
      <td class="num">{{ number_format(($summary['total_collected'] ?? $rows->sum('total_paid')) / 100, 2) }}</td>
      <td class="num">{{ number_format(($summary['total_balance'] ?? $rows->sum('balance_due')) / 100, 2) }}</td>
    </tr>
  </tfoot>
</table>
<div class="footer">Ikonex Finance — {{ $school->name ?? '' }} &nbsp;|&nbsp; Printed: {{ $date }}</div>
</body></html>
