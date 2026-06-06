<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Report Card - {{ $student->first_name }} {{ $student->last_name }}</title>
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
        .info-card {
            border: 1px solid #ccc;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        .info-card-header {
            background-color: #f5f5f5;
            padding: 5px 10px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid #ccc;
        }
        .info-card-body {
            padding: 8px 10px;
        }
        .info-grid {
            width: 100%;
        }
        .info-grid td {
            width: 50%;
            padding: 2px 0;
            font-size: 11px;
        }
        .label {
            color: #666;
        }
        .value {
            font-weight: bold;
        }
        .marks-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .marks-table th, .marks-table td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: left;
        }
        .marks-table th {
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
            margin-top: 35px;
        }
        .footer-sigs td {
            width: 33.3%;
            text-align: center;
        }
        .sig-line {
            border-bottom: 1px solid #333;
            width: 80%;
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
            margin-top: 30px;
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
        <div class="doc-title">Academic Progress Report</div>
    </div>

    <table class="meta-table">
        <tr>
            <td style="font-size: 11px;">
                <span class="label">Document Type:</span>
                <span class="value">{{ $exam->name }}</span>
            </td>
            <td class="text-right" style="font-size: 11px;">
                <span class="label">Term:</span>
                <span class="value">Term {{ $exam->term }}</span>
                &nbsp;|&nbsp;
                <span class="label">Year:</span>
                <span class="value">{{ $exam->year }}</span>
            </td>
        </tr>
    </table>

    <div class="info-card">
        <div class="info-card-header">Student Information</div>
        <div class="info-card-body">
            <table class="info-grid">
                <tr>
                    <td>
                        <span class="label">Full Name:</span>
                        <span class="value">{{ $student->first_name }} {{ $student->last_name }}</span>
                    </td>
                    <td>
                        <span class="label">Admission No:</span>
                        <span class="value" style="font-family: monospace;">{{ $student->admission_number }}</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span class="label">Class:</span>
                        <span class="value">{{ $student->grade_level }}</span>
                    </td>
                    <td>
                        <span class="label">Gender:</span>
                        <span class="value">{{ $student->gender }}</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span class="label">Curriculum:</span>
                        <span class="value">{{ $isCBC ? 'CBC' : '8-4-4' }}</span>
                    </td>
                    <td>
                        <span class="label">Overall Rank:</span>
                        <span class="value">{{ $studentRankInfo['rank'] }} of {{ $studentRankInfo['total_students'] }}</span>
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <table class="marks-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 30%;">Subject</th>
                <th class="text-center" style="width: 12%;">Marks</th>
                <th class="text-center" style="width: 12%;">Out of</th>
                <th class="text-center" style="width: 10%;">%</th>
                <th class="text-center" style="width: 10%;">Grade</th>
                @if(!$isCBC)
                    <th class="text-center" style="width: 8%;">Pts</th>
                @endif
                <th class="text-center" style="width: 12%;">Pos</th>
                <th>Remarks</th>
            </tr>
        </thead>
        <tbody>
            @forelse($subjects as $index => $sub)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="bold">{{ $sub['subject'] }}</td>
                    <td class="text-center">{{ $sub['marks'] }}</td>
                    <td class="text-center" style="color: #666;">{{ $sub['out_of'] }}</td>
                    <td class="text-center">{{ $sub['percent'] }}%</td>
                    <td class="text-center bold">{{ $sub['grade'] }}</td>
                    @if(!$isCBC)
                        <td class="text-center" style="color: #444;">{{ $sub['points'] }}</td>
                    @endif
                    <td class="text-center bold">{{ $sub['rank'] !== '—' ? $sub['rank'] . '/' . $sub['total_students'] : '—' }}</td>
                    <td style="color: #666; font-size: 11px;">{{ $sub['remarks'] ?: '—' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="{{ $isCBC ? 8 : 9 }}" class="text-center" style="color: #999; padding: 15px;">
                        No marks recorded for this examination.
                    </td>
                </tr>
            @endforelse
        </tbody>
        @if($subjects->count() > 0)
            <tfoot>
                <tr class="bold" style="background-color: #f9f9f9;">
                    <td colspan="2" class="text-center">TOTAL / MEAN</td>
                    <td class="text-center">{{ $totalMarks }}</td>
                    <td class="text-center" style="color: #666;">{{ $totalOutOf }}</td>
                    <td class="text-center">{{ $avgPct !== null ? $avgPct . '%' : '—' }}</td>
                    <td class="text-center">{{ $meanGrade }}</td>
                    @if(!$isCBC)
                        <td class="text-center">{{ $meanPoints ? round($meanPoints, 1) : '—' }}</td>
                    @endif
                    <td class="text-center"></td>
                    <td></td>
                </tr>
            </tfoot>
        @endif
    </table>

    @if(!$isCBC)
        <div style="font-size: 10px; color: #666; margin-bottom: 15px;">
            <span class="bold">Grading Scale:</span>
            A(80-100) &nbsp; A-(75-79) &nbsp; B+(70-74) &nbsp; B(65-69) &nbsp; B-(60-64) &nbsp;
            C+(55-59) &nbsp; C(50-54) &nbsp; C-(45-49) &nbsp; D+(40-44) &nbsp; D(35-39) &nbsp;
            D-(30-34) &nbsp; E(0-29)
        </div>
    @else
        <div style="font-size: 10px; color: #666; margin-bottom: 15px;">
            <span class="bold">Performance Scale:</span>
            EE - Exceeding Expectations &nbsp; ME - Meeting Expectations &nbsp;
            AE - Approaching Expectations &nbsp; BE - Below Expectations
        </div>
    @endif

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
            <td>
                <div class="sig-line"></div>
                <div class="sig-label">Parent / Guardian</div>
            </td>
        </tr>
    </table>

    <div class="official-note">
        This is an official academic document of {{ $school->name ?? 'Kasee Academy' }}.
        Generated on {{ date('d/m/Y') }}.
    </div>

</body>
</html>
