<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>M-Pesa Transaction Report</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a202c; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #276749; padding-bottom: 10px; margin-bottom: 16px; }
  .school-name { font-size: 16px; font-weight: bold; color: #276749; }
  .report-title { font-size: 13px; font-weight: bold; color: #2d3748; margin-top: 4px; }
  .meta { font-size: 9px; color: #718096; margin-top: 2px; }
  .sum-row { display: flex; gap: 10px; margin-bottom: 14px; }
  .sum-box { flex: 1; border: 1px solid #9ae6b4; background: #f0fff4; border-radius: 4px; padding: 8px; text-align: center; }
  .sum-box .val { font-size: 13px; font-weight: bold; color: #276749; }
  .sum-box .lbl { font-size: 8px; color: #718096; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #276749; color: white; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: bold; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  .matched { color: #276749; font-weight: bold; } .unmatched { color: #c53030; }
  .num { text-align: right; font-family: monospace; }
  .footer { margin-top: 20px; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 6px; }
</style>
</head>
<body>
<div class="header">
  <div class="school-name">{{ $school->name ?? 'School' }}</div>
  <div class="report-title">M-Pesa Transaction Report</div>
  <div class="meta">Period: {{ $params['from'] ?? '—' }} to {{ $params['to'] ?? '—' }} &nbsp;|&nbsp; Generated: {{ $date }}</div>
</div>

@php $s = $data['summary'] ?? []; $rows = collect($data['data'] ?? []); @endphp

<div class="sum-row">
  <div class="sum-box"><div class="val">{{ $s['total'] ?? $rows->count() }}</div><div class="lbl">Total</div></div>
  <div class="sum-box"><div class="val" style="color:#276749">{{ $s['matched'] ?? 0 }}</div><div class="lbl">Matched</div></div>
  <div class="sum-box"><div class="val" style="color:#c53030">{{ $s['unmatched'] ?? 0 }}</div><div class="lbl">Unmatched</div></div>
  <div class="sum-box"><div class="val">KES {{ number_format(($s['total_amount'] ?? 0) / 100, 2) }}</div><div class="lbl">Total Amount</div></div>
</div>

<table>
  <thead><tr><th>#</th><th>M-Pesa Code</th><th>Type</th><th>Date</th><th>Account Ref</th><th>Student</th><th class="num">Amount (KES)</th><th>Status</th></tr></thead>
  <tbody>
    @foreach ($rows as $i => $r)
    @php $r = (array) $r; @endphp
    <tr>
      <td>{{ $i + 1 }}</td>
      <td style="font-family:monospace">{{ $r['mpesa_receipt_number'] ?? '—' }}</td>
      <td>{{ strtoupper($r['transaction_type'] ?? '—') }}</td>
      <td>{{ $r['transaction_date'] ?? '—' }}</td>
      <td>{{ $r['account_reference'] ?? '—' }}</td>
      <td>{{ $r['student_name'] ?? '—' }}</td>
      <td class="num">{{ number_format(($r['amount'] ?? 0) / 100, 2) }}</td>
      <td class="{{ $r['is_matched'] ? 'matched' : 'unmatched' }}">{{ $r['is_matched'] ? '✓ Matched' : '✗ Unmatched' }}</td>
    </tr>
    @endforeach
  </tbody>
</table>
<div class="footer">Ikonex Finance — {{ $school->name ?? '' }} &nbsp;|&nbsp; Printed: {{ $date }}</div>
</body></html>
