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
    public static function toGrade(float $marks, float $outOf = 100): string
    {
        $pct = ($marks / $outOf) * 100;
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
