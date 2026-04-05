<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolSetting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * GET /api/admin/settings
     * Returns all settings for the authenticated user's school.
     * Platform admins have no school — return 403.
     */
    public function index()
    {
        if (auth()->user()->isPlatformAdmin()) {
            return response()->json(['message' => 'Platform admins do not have school-level settings.'], 403);
        }

        $settings = SchoolSetting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    /**
     * POST /api/admin/settings
     * Upserts settings for the authenticated school only.
     */
    public function update(Request $request)
    {
        if (auth()->user()->isPlatformAdmin()) {
            return response()->json(['message' => 'Platform admins cannot edit school settings.'], 403);
        }

        $schoolId = auth()->user()->school_id;

        $allowed = [
            // General
            'school_name', 'contact_email', 'contact_phone',
            'academic_year', 'current_term', 'address', 'motto',
            'county', 'sub_county', 'principal_name',
            // Kenya-specific
            'nemis_school_code', 'school_type', 'curriculum_type', 'kra_pin',
            // Academic
            'grading_scale', 'passing_mark', 'max_class_size',
            // Finance
            'late_fee_percentage', 'installment_limit', 'currency',
            // Notifications
            'sms_notifications', 'email_notifications', 'parent_portal_enabled',
            // Appearance
            'primary_color', 'theme_style',
        ];

        foreach ($request->only($allowed) as $key => $value) {
            SchoolSetting::updateOrCreate(
                ['school_id' => $schoolId, 'key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'Settings saved successfully.']);
    }
}
