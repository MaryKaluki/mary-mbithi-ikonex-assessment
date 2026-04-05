<?php

namespace App\Http\Controllers;

use App\Models\SchoolSetting;

class BrandingController extends Controller
{
    /**
     * GET /api/school/branding
     * Accessible to ALL authenticated users — returns the school's primary_color and theme_style.
     */
    public function index()
    {
        $user = auth()->user();

        if (!$user || !$user->school_id) {
            return response()->json([
                'primary_color' => '#9333ea',
                'theme_style'   => 'accented',
            ]);
        }

        $settings = SchoolSetting::where('school_id', $user->school_id)
            ->whereIn('key', ['primary_color', 'theme_style', 'school_name'])
            ->get()
            ->pluck('value', 'key');

        return response()->json([
            'primary_color' => $settings->get('primary_color', '#9333ea'),
            'theme_style'   => $settings->get('theme_style',   'accented'),
            'school_name'   => $settings->get('school_name',   null),
        ]);
    }
}
