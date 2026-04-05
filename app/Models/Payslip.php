<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Payslip extends Model
{
    use BelongsToTenant;

    protected $guarded = [];

    protected $casts = [
        'basic_salary'     => 'float',
        'allowance'        => 'float',
        'gross_salary'     => 'float',
        'nssf'             => 'float',
        'shif'             => 'float',
        'housing_levy'     => 'float',
        'paye'             => 'float',
        'total_deductions' => 'float',
        'net_salary'       => 'float',
        'year'             => 'integer',
        'month'            => 'integer',
        'processed_at'     => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    /** "April 2026" */
    public function getMonthLabelAttribute(): string
    {
        return date('F Y', mktime(0, 0, 0, $this->month, 1, $this->year));
    }

    /**
     * Kenyan statutory deduction calculator.
     * Returns array: nssf, shif, housing_levy, taxable_income, paye, total_deductions, net_salary
     */
    public static function calculateDeductions(float $basic, float $allowance): array
    {
        $gross = $basic + $allowance;

        // NSSF: 6% of gross, capped at KES 4,320 if gross > 72,000
        $nssf = $gross > 72000 ? 4320.00 : round($gross * 0.06, 2);

        // SHIF: 2.75% of gross
        $shif = round($gross * 0.0275, 2);

        // Housing Levy: 1.5% of gross
        $housingLevy = round($gross * 0.015, 2);

        // PAYE: on taxable income (gross - nssf - shif)
        $taxableIncome = $gross - $nssf - $shif;
        $paye = self::calculatePAYE($taxableIncome);

        $totalDeductions = $nssf + $shif + $housingLevy + $paye;
        $net = max(0, $gross - $totalDeductions);

        return [
            'basic_salary'     => $basic,
            'allowance'        => $allowance,
            'gross_salary'     => $gross,
            'nssf'             => $nssf,
            'shif'             => $shif,
            'housing_levy'     => $housingLevy,
            'paye'             => $paye,
            'total_deductions' => round($totalDeductions, 2),
            'net_salary'       => round($net, 2),
        ];
    }

    private static function calculatePAYE(float $taxableIncome): float
    {
        $tax = 0.0;

        // Kenya PAYE graduated brackets (monthly)
        $brackets = [
            [24000,  0.10],
            [8333,   0.25],
            [PHP_FLOAT_MAX, 0.30],
        ];

        $remaining = $taxableIncome;
        foreach ($brackets as [$limit, $rate]) {
            if ($remaining <= 0) break;
            $band = min($remaining, $limit);
            $tax += $band * $rate;
            $remaining -= $band;
        }

        // Personal relief: KES 2,400/month
        $tax = max(0, $tax - 2400);

        return round($tax, 2);
    }
}
