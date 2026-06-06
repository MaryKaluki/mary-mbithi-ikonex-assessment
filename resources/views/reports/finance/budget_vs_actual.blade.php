<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>Budget vs Actual</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a202c; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #553c9a; padding-bottom: 10px; margin-bottom: 16px; }
  .school-name { font-size: 16px; font-weight: bold; color: #553c9a; }
  .report-title { font-size: 13px; font-weight: bold; color: #2d3748; margin-top: 4px; }
  .meta { font-size: 9px; color: #718096; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #553c9a; color: white; padding: 6px 8px; text-align: left; font-size: 9px; font-weight: bold; text-transform: uppercase; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tbody tr:nth-child(even) { background: #faf5ff; }
  .num { text-align: right; font-family: monospace; }
  .ok { color: #276749; font-weight: bold; }
  .warning { color: #c05621; font-weight: bold; }
  .over { color: #c53030; font-weight: bold; }
  .bar-bg { background: #e2e8f0; border-radius: 2px; height: 6px; width: 100%; }
  .bar-fill { height: 6px; border-radius: 2px; }
  tfoot td { background: #2d3748; color: white; font-weight: bold; padding: 6px 8px; }
  .footer { margin-top: 20px; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 6px; }
</style>
</head>
<body>
<div class="header">
  <div class="school-name">{{ $school->name ?? 'School' }}</div>
  <div class="report-title">Budget vs Actual</div>
  <div class="meta">Year: {{ $data['period']['year'] ?? '—' }} {{ isset($data['period']['month']) ? ' Month: '.$data['period']['month'] : '(Full Year)' }} &nbsp;|&nbsp; Generated: {{ $date }}</div>
</div>

@php
  $rows = collect($data['data'] ?? []);
  $s    = $data['summary'] ?? [];
@endphp

<table>
  <thead>
    <tr><th>#</th><th>Category</th><th class="num">Budget (KES)</th><th class="num">Actual (KES)</th><th class="num">Variance (KES)</th><th>% Used</th><th>Status</th></tr>
  </thead>
  <tbody>
    @foreach ($rows as $i => $r)
    @php $r = (array) $r; $pct = $r['pct_used'] ?? 0; @endphp
    <tr>
      <td>{{ $i + 1 }}</td>
      <td>{{ $r['name'] ?? '—' }} <small style="color:#a0aec0">({{ $r['code'] ?? '' }})</small></td>
      <td class="num">{{ number_format(($r['budget'] ?? 0) / 100, 2) }}</td>
      <td class="num">{{ number_format(($r['actual'] ?? 0) / 100, 2) }}</td>
      <td class="num {{ ($r['variance'] ?? 0) < 0 ? 'over' : 'ok' }}">{{ number_format(($r['variance'] ?? 0) / 100, 2) }}</td>
      <td>
        <div class="bar-bg"><div class="bar-fill" style="width:{{ min(100, $pct) }}%; background:{{ $pct > 100 ? '#e53e3e' : ($pct > 80 ? '#dd6b20' : '#38a169') }};"></div></div>
        <small>{{ $pct }}%</small>
      </td>
      <td class="{{ $r['status'] === 'over' ? 'over' : ($r['status'] === 'warning' ? 'warning' : 'ok') }}">
        {{ strtoupper($r['status'] ?? '—') }}
      </td>
    </tr>
    @endforeach
  </tbody>
  <tfoot>
    <tr><td colspan="2">TOTALS</td><td class="num">{{ number_format(($s['total_budget'] ?? 0) / 100, 2) }}</td><td class="num">{{ number_format(($s['total_actual'] ?? 0) / 100, 2) }}</td><td colspan="3">{{ $s['over_budget'] ?? 0 }} categories over budget</td></tr>
  </tfoot>
</table>
<div class="footer">Skullu Finance — {{ $school->name ?? '' }} &nbsp;|&nbsp; Printed: {{ $date }}</div>
</body></html>
