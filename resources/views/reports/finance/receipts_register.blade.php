<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Receipts Register</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a202c; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #1a365d; padding-bottom: 10px; margin-bottom: 16px; }
  .school-name { font-size: 16px; font-weight: bold; color: #1a365d; }
  .report-title { font-size: 13px; font-weight: bold; color: #2d3748; margin-top: 4px; }
  .meta { font-size: 9px; color: #718096; margin-top: 2px; }
  .stats { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #1a365d; color: white; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: bold; text-transform: uppercase; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tbody tr:nth-child(even) { background: #f7fafc; }
  .amount { text-align: right; font-family: monospace; }
  tfoot td { background: #2d3748; color: white; font-weight: bold; padding: 6px 8px; }
  .footer { margin-top: 20px; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 6px; }
  .method-badge { display: inline-block; padding: 1px 5px; border-radius: 3px; font-size: 8px; font-weight: bold; text-transform: uppercase; background:#bee3f8; color:#2b6cb0; }
</style>
</head>
<body>
<div class="header">
  <div class="school-name">{{ $school->name ?? 'School' }}</div>
  <div class="report-title">Receipts Register</div>
  <div class="meta">
    Period: {{ $params['from'] ?? '—' }} to {{ $params['to'] ?? '—' }}
    &nbsp;|&nbsp; Generated: {{ $date }}
  </div>
</div>

@php
  $receipts = $data['data'] ?? $data['receipts'] ?? collect([]);
  $meta     = $data['meta'] ?? [];
  $total    = is_array($meta) ? ($meta['total_amount'] ?? collect($receipts)->sum('amount')) : 0;
@endphp

<div class="stats">
  <strong>{{ count($receipts) }}</strong> receipts &nbsp;|&nbsp;
  <strong>Total: KES {{ number_format($total / 100, 2) }}</strong>
</div>

<table>
  <thead>
    <tr>
      <th>#</th><th>Receipt No</th><th>Invoice No</th><th>Date</th>
      <th>Student</th><th>Adm No</th><th>Method</th><th class="amount">Amount (KES)</th><th>Cashier</th>
    </tr>
  </thead>
  <tbody>
    @foreach ($receipts as $i => $r)
    @php $r = (array) $r; @endphp
    <tr>
      <td>{{ $i + 1 }}</td>
      <td>{{ $r['receipt_number'] ?? '—' }}</td>
      <td>{{ $r['invoice_number'] ?? '—' }}</td>
      <td>{{ $r['payment_date'] ?? '—' }}</td>
      <td>{{ ($r['first_name'] ?? '') . ' ' . ($r['last_name'] ?? '') }}</td>
      <td>{{ $r['admission_number'] ?? '—' }}</td>
      <td><span class="method-badge">{{ $r['payment_method'] ?? '—' }}</span></td>
      <td class="amount">{{ number_format(($r['amount'] ?? 0) / 100, 2) }}</td>
      <td>{{ $r['cashier_name'] ?? '—' }}</td>
    </tr>
    @endforeach
  </tbody>
  <tfoot>
    <tr><td colspan="7">TOTAL</td><td class="amount">{{ number_format($total / 100, 2) }}</td><td></td></tr>
  </tfoot>
</table>

<div class="footer">Skullu Finance — {{ $school->name ?? '' }} &nbsp;|&nbsp; Printed: {{ $date }}</div>
</body></html>
