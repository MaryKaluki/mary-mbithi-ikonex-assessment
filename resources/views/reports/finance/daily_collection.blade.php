<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Daily Collection Report</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a202c; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #1a365d; padding-bottom: 10px; margin-bottom: 16px; }
  .school-name { font-size: 16px; font-weight: bold; color: #1a365d; }
  .report-title { font-size: 13px; font-weight: bold; color: #2d3748; margin-top: 4px; }
  .meta { font-size: 9px; color: #718096; margin-top: 2px; }
  .summary-box { display: inline-block; background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 4px; padding: 8px 16px; margin: 8px 6px; text-align: center; vertical-align: top; }
  .summary-box .label { font-size: 8px; color: #4a5568; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-box .value { font-size: 14px; font-weight: bold; color: #2b6cb0; }
  .summaries { text-align: center; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  thead th { background: #1a365d; color: white; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tbody tr:nth-child(even) { background: #f7fafc; }
  .method-badge { display: inline-block; padding: 1px 5px; border-radius: 3px; font-size: 8px; font-weight: bold; text-transform: uppercase; }
  .method-cash { background: #c6f6d5; color: #276749; }
  .method-mpesa { background: #bee3f8; color: #2b6cb0; }
  .method-bank_transfer { background: #fed7e2; color: #702459; }
  .method-cheque { background: #fefcbf; color: #744210; }
  .method-card { background: #e9d8fd; color: #553c9a; }
  .amount { text-align: right; font-family: monospace; }
  tfoot td { background: #2d3748; color: white; font-weight: bold; padding: 6px 8px; }
  .footer { margin-top: 20px; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 6px; }
</style>
</head>
<body>

<div class="header">
  <div class="school-name">{{ $school->name ?? 'School' }}</div>
  <div class="report-title">Daily Collection Report</div>
  <div class="meta">Date: {{ $params['date'] ?? $date }} &nbsp;|&nbsp; Generated: {{ $date }}</div>
</div>

<div class="summaries">
  @php
    $receipts = $data['receipts'] ?? collect([]);
    $summary  = $data['summary'] ?? [];
  @endphp
  <div class="summary-box">
    <div class="value">{{ $summary['total_receipts'] ?? count($receipts) }}</div>
    <div class="label">Receipts</div>
  </div>
  <div class="summary-box">
    <div class="value">KES {{ number_format(($summary['total_amount'] ?? 0) / 100, 2) }}</div>
    <div class="label">Total Collected</div>
  </div>
  @foreach ($summary['by_method'] ?? [] as $method => $m)
  <div class="summary-box">
    <div class="value">KES {{ number_format($m['amount'] / 100, 2) }}</div>
    <div class="label">{{ ucwords(str_replace('_', ' ', $method)) }} ({{ $m['count'] }})</div>
  </div>
  @endforeach
</div>

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Receipt No</th>
      <th>Student</th>
      <th>Adm No</th>
      <th>Method</th>
      <th>Reference</th>
      <th class="amount">Amount (KES)</th>
      <th>Cashier</th>
    </tr>
  </thead>
  <tbody>
    @foreach ($receipts as $i => $r)
    <tr>
      <td>{{ $i + 1 }}</td>
      <td>{{ $r['receipt_number'] ?? $r->receipt_number }}</td>
      <td>{{ ($r['first_name'] ?? $r->first_name) . ' ' . ($r['last_name'] ?? $r->last_name) }}</td>
      <td>{{ $r['admission_number'] ?? $r->admission_number }}</td>
      <td><span class="method-badge method-{{ str_replace(' ', '_', $r['payment_method'] ?? $r->payment_method) }}">{{ $r['payment_method'] ?? $r->payment_method }}</span></td>
      <td>{{ $r['mpesa_code'] ?? $r['bank_ref'] ?? $r['cheque_number'] ?? ($r->mpesa_code ?? $r->bank_ref ?? $r->cheque_number ?? '—') }}</td>
      <td class="amount">{{ number_format(($r['amount'] ?? $r->amount) / 100, 2) }}</td>
      <td>{{ $r['cashier_name'] ?? ($r->cashier_name ?? '—') }}</td>
    </tr>
    @endforeach
  </tbody>
  <tfoot>
    <tr>
      <td colspan="6">TOTAL</td>
      <td class="amount">{{ number_format(($summary['total_amount'] ?? 0) / 100, 2) }}</td>
      <td></td>
    </tr>
  </tfoot>
</table>

<div class="footer">
  Ikonex Finance — {{ $school->name ?? '' }} &nbsp;|&nbsp; Printed: {{ $date }} &nbsp;|&nbsp; This is a computer-generated document.
</div>
</body>
</html>
