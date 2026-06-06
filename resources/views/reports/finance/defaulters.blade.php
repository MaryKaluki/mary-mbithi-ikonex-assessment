<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>Defaulters List</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a202c; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #c53030; padding-bottom: 10px; margin-bottom: 16px; }
  .school-name { font-size: 16px; font-weight: bold; color: #c53030; }
  .report-title { font-size: 13px; font-weight: bold; color: #2d3748; margin-top: 4px; }
  .meta { font-size: 9px; color: #718096; margin-top: 2px; }
  .alert-bar { background: #fff5f5; border: 1px solid #feb2b2; border-radius: 4px; padding: 8px 12px; margin-bottom: 14px; font-weight: bold; color: #c53030; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #c53030; color: white; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: bold; text-transform: uppercase; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tbody tr:nth-child(even) { background: #fff5f5; }
  .num { text-align: right; font-family: monospace; }
  tfoot td { background: #2d3748; color: white; font-weight: bold; padding: 6px 8px; }
  .footer { margin-top: 20px; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 6px; }
</style>
</head>
<body>
<div class="header">
  <div class="school-name">{{ $school->name ?? 'School' }}</div>
  <div class="report-title">Fee Defaulters List</div>
  <div class="meta">{{ isset($params['academic_year']) ? 'Year: '.$params['academic_year'] : '' }} {{ isset($params['term']) ? ' Term: '.$params['term'] : '' }} &nbsp;|&nbsp; Generated: {{ $date }}</div>
</div>

@php
  $rows = collect($data['data'] ?? []);
  $summary = $data['summary'] ?? [];
@endphp

<div class="alert-bar">
  ⚠ {{ $summary['count'] ?? $rows->count() }} student(s) with outstanding balance totalling KES {{ number_format(($summary['total_balance'] ?? $rows->sum('balance_due')) / 100, 2) }}
</div>

<table>
  <thead>
    <tr><th>#</th><th>Student</th><th>Adm No</th><th>Class</th><th>Parent Phone</th><th>Earliest Due</th><th class="num">Balance (KES)</th></tr>
  </thead>
  <tbody>
    @foreach ($rows as $i => $r)
    @php $r = (array) $r; @endphp
    <tr>
      <td>{{ $i + 1 }}</td>
      <td>{{ ($r['first_name'] ?? '') . ' ' . ($r['last_name'] ?? '') }}</td>
      <td>{{ $r['admission_number'] ?? '—' }}</td>
      <td>{{ $r['class_name'] ?? '—' }}</td>
      <td>{{ $r['parent_phone'] ?? '—' }}</td>
      <td>{{ $r['earliest_due'] ?? '—' }}</td>
      <td class="num" style="color:#c53030; font-weight:bold;">{{ number_format(($r['balance_due'] ?? 0) / 100, 2) }}</td>
    </tr>
    @endforeach
  </tbody>
  <tfoot>
    <tr><td colspan="6">TOTAL OUTSTANDING</td><td class="num">{{ number_format(($summary['total_balance'] ?? $rows->sum('balance_due')) / 100, 2) }}</td></tr>
  </tfoot>
</table>
<div class="footer">Skullu Finance — {{ $school->name ?? '' }} &nbsp;|&nbsp; Printed: {{ $date }} &nbsp;|&nbsp; CONFIDENTIAL</div>
</body></html>
