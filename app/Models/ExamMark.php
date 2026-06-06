<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamMark extends Model
{
    use HasFactory, \App\Models\Traits\BelongsToTenant;

    protected $guarded = [];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Convert marks to Kenya letter grade.
     */
    public static function toGrade(float $marks, float $outOf = 100, ?string $schoolId = null): string
    {
        $pct = $outOf > 0 ? ($marks / $outOf) * 100 : 0;

        if (!$schoolId && auth()->check()) {
            $schoolId = auth()->user()->school_id;
        }

        $scale = 'Kenya CBC (A-E)';
        if ($schoolId) {
            $setting = \Illuminate\Support\Facades\DB::table('school_settings')
                ->where('school_id', $schoolId)
                ->where('key', 'grading_scale')
                ->first();
            if ($setting) {
                $scale = $setting->value;
            }
        }

        if ($scale === 'Percentage (0-100)') {
            return round($pct, 0) . '%';
        }

        if ($scale === 'GPA (0-4.0)') {
            return match(true) {
                $pct >= 90 => '4.0 (A)',
                $pct >= 85 => '3.7 (A-)',
                $pct >= 80 => '3.3 (B+)',
                $pct >= 75 => '3.0 (B)',
                $pct >= 70 => '2.7 (B-)',
                $pct >= 65 => '2.3 (C+)',
                $pct >= 60 => '2.0 (C)',
                $pct >= 55 => '1.7 (C-)',
                $pct >= 50 => '1.3 (D+)',
                $pct >= 45 => '1.0 (D)',
                $pct >= 40 => '0.7 (D-)',
                default    => '0.0 (E)',
            };
        }

        return match(true) {
            $pct >= 80 => 'A',
            $pct >= 75 => 'A-',
            $pct >= 70 => 'B+',
            $pct >= 65 => 'B',
            $pct >= 60 => 'B-',
            $pct >= 55 => 'C+',
            $pct >= 50 => 'C',
            $pct >= 45 => 'C-',
            $pct >= 40 => 'D+',
            $pct >= 35 => 'D',
            $pct >= 30 => 'D-',
            default    => 'E',
        };
    }
}
