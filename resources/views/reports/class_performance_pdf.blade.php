<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Class Performance Report - {{ $class->name }}</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .school-name {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 5px 0;
        }
        .school-details {
            font-size: 10px;
            color: #666;
            margin: 0;
        }
        .doc-title {
            display: inline-block;
            border: 1px solid #333;
            padding: 4px 15px;
            margin-top: 10px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 15px;
        }
        .meta-table td {
            padding: 3px 0;
        }
        .performance-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .performance-table th, .performance-table td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: left;
        }
        .performance-table th {
            background-color: #f5f5f5;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .text-center {
            text-align: center !important;
        }
        .text-right {
            text-align: right !important;
        }
        .bold {
            font-weight: bold;
        }
        .footer-sigs {
            width: 100%;
            margin-top: 45px;
        }
        .footer-sigs td {
            width: 50%;
            text-align: center;
        }
        .sig-line {
            border-bottom: 1px solid #333;
            width: 60%;
            margin: 0 auto 5px auto;
            height: 25px;
        }
        .sig-label {
            font-size: 9px;
            color: #666;
            text-transform: uppercase;
        }
        .official-note {
            text-align: center;
            font-size: 9px;
            color: #999;
            margin-top: 40px;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1 class="school-name">{{ $school->name ?? 'School Name' }}</h1>
        <p class="school-details">
            @if(!empty($school->address)) {{ $school->address }} @endif
            @if(!empty($school->phone)) | Tel: {{ $school->phone }} @endif
        </p>
        <div class="doc-title">Class Stream Performance Report</div>
    </div>

    <table class="meta-table">
        <tr>
            <td style="font-size: 11px;">
                <span class="bold">Class:</span> {{ $class->name }} &nbsp;|&nbsp;
                <span class="bold">Curriculum:</span> {{ $class->curriculum_type }}
            </td>
            <td class="text-right" style="font-size: 11px;">
                <span class="bold">Examination:</span> {{ $exam->name }} &nbsp;|&nbsp;
                <span class="bold">Term:</span> Term {{ $exam->term }} &nbsp;|&nbsp;
                <span class="bold">Year:</span> {{ $exam->year }}
            </td>
        </tr>
    </table>

    <table class="performance-table">
        <thead>
            <tr>
                <th class="text-center" style="width: 8%;">Rank</th>
                <th style="width: 20%;">Admission No</th>
                <th>Student Name</th>
                <th class="text-center" style="width: 15%;">Total Marks</th>
                <th class="text-center" style="width: 15%;">Average %</th>
                <th class="text-center" style="width: 15%;">Mean Grade</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
                <tr style="{{ $row['rank'] === 1 ? 'background-color: #fffde7;' : '' }}">
                    <td class="text-center bold">{{ $row['rank'] }}</td>
                    <td style="font-family: monospace;">{{ $row['admission_number'] }}</td>
                    <td class="bold">{{ $row['name'] }}</td>
                    <td class="text-center">{{ round($row['total_marks'], 1) }}</td>
                    <td class="text-center">{{ $row['average_pct'] !== null ? $row['average_pct'] . '%' : '—' }}</td>
                    <td class="text-center bold">{{ $row['mean_grade'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center" style="color: #999; padding: 15px;">
                        No student performance details available.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <table class="footer-sigs">
        <tr>
            <td>
                <div class="sig-line"></div>
                <div class="sig-label">Class Teacher</div>
            </td>
            <td>
                <div class="sig-line"></div>
                <div class="sig-label">Principal / Head Teacher</div>
            </td>
        </tr>
    </table>

    <div class="official-note">
        This is an official performance record of {{ $school->name ?? 'Kasee Academy' }} for {{ $class->name }}.
        Generated on {{ date('d/m/Y') }}.
    </div>

</body>
</html>
