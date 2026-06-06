<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>Student Financial Statement</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a202c; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #1a365d; padding-bottom: 10px; margin-bottom: 16px; }
  .school-name { font-size: 16px; font-weight: bold; color: #1a365d; }
  .report-title { font-size: 13px; font-weight: bold; color: #2d3748; margin-top: 4px; }
  .meta { font-size: 9px; color: #718096; margin-top: 2px; }
  .student-card { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; }
  .student-card div { line-height: 1.6; }
  .balance-box { text-align: center; padding: 8px 16px; border-radius: 4px; }
  .balance-due { background: #fff5f5; border: 1px solid #feb2b2; color: #c53030; }
  .balance-ok { background: #f0fff4; border: 1px solid #9ae6b4; color: #276749; }
  h3 { font-size: 11px; color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 14px 0 6px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  thead th { background: #1a365d; color: white; padding: 5px 8px; text-align: left; font-size: 9px; font-weight: bold; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  .num { text-align: right; font-family: monospace; }
  .status-paid { color: #276749; } .status-partial { color: #c05621; } .status-issued { color: #c53030; }
  .footer { margin-top: 20px; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 6px; }
</style>
</head>
<body>
<div class="header">
  <div class="school-name">{{ $school->name ?? 'School' }}</div>
  <div class="report-title">Student Financial Statement</div>
  <div class="meta">Generated: {{ $date }}</div>
</div>

@php
  $student = (array) ($data['student'] ?? []);
  $invoices = collect($data['invoices'] ?? []);
  $summary  = $data['summary'] ?? [];
  $balance  = $summary['balance_due'] ?? $invoices->sum('balance');
@endphp

<div class="student-card">
  <div>
    <strong>{{ ($student['first_name'] ?? '') . ' ' . ($student['last_name'] ?? '') }}</strong><br>
    Adm No: {{ $student['admission_number'] ?? '—' }}<br>
    Class: {{ $student['grade_level'] ?? '—' }}<br>
    Parent: {{ $student['parent_name'] ?? '—' }} ({{ $student['parent_phone'] ?? '—' }})
  </div>
  <div class="balance-box {{ $balance > 0 ? 'balance-due' : 'balance-ok' }}">
    <div style="font-size:16px; font-weight:bold;">KES {{ number_format(abs($balance) / 100, 2) }}</div>
    <div style="font-size:8px; text-transform:uppercase;">{{ $balance > 0 ? 'Amount Due' : ($balance < 0 ? 'Overpaid' : 'Fully Paid') }}</div>
  </div>
</div>

@foreach ($invoices as $inv)
@php $inv = (array) $inv; $payments = collect($inv['payments'] ?? []); @endphp
<h3>Invoice {{ $inv['invoice_number'] ?? '—' }} — {{ $inv['academic_year'] ?? '—' }} Term {{ $inv['term'] ?? '—' }}</h3>
<table>
  <thead><tr><th>Description</th><th class="num">Amount (KES)</th></tr></thead>
  <tbody>
    <tr><td>Total Charged</td><td class="num">{{ number_format(($inv['total_charged'] ?? 0) / 100, 2) }}</td></tr>
    <tr><td>Total Paid</td><td class="num" style="color:#276749">{{ number_format(($inv['total_paid'] ?? 0) / 100, 2) }}</td></tr>
    <tr><td><strong>Balance</strong></td><td class="num {{ 'status-' . ($inv['status'] ?? 'issued') }}"><strong>{{ number_format(($inv['balance'] ?? 0) / 100, 2) }}</strong></td></tr>
  </tbody>
</table>
@if ($payments->isNotEmpty())
<p style="margin:4px 0 2px; font-weight:bold; font-size:9px;">Payments Received:</p>
<table>
  <thead><tr><th>Receipt No</th><th>Date</th><th>Method</th><th class="num">Amount (KES)</th></tr></thead>
  <tbody>
    @foreach ($payments as $p)
    @php $p = (array) $p; @endphp
    <tr><td>{{ $p['receipt_number'] ?? '—' }}</td><td>{{ $p['payment_date'] ?? '—' }}</td><td>{{ $p['payment_method'] ?? '—' }}</td><td class="num">{{ number_format(($p['amount'] ?? 0) / 100, 2) }}</td></tr>
    @endforeach
  </tbody>
</table>
@endif
@endforeach

<div class="footer">Ikonex Finance — {{ $school->name ?? '' }} &nbsp;|&nbsp; Printed: {{ $date }} &nbsp;|&nbsp; Statement is accurate as of print date.</div>
</body></html>
