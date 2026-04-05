<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SchoolController extends Controller
{
    public function index()
    {
        return response()->json(
            School::withoutGlobalScopes()->with('subscription')->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string',
            'domain'          => 'required|string|unique:schools,domain',
            'school_type'     => 'required|string|in:Kindergarten,Primary (CBC),Junior School,Senior School,Hybrid',
            'phone'           => 'nullable|string',
            'address'         => 'nullable|string',
            'deployment_date' => 'nullable|date',
            'admin_email'     => 'required|email|unique:users,email',
            'plan'            => 'required|in:Basic,Standard,Enterprise',
        ]);

        return DB::transaction(function () use ($validated) {
            // Generate ID e.g., MSI-94X2
            $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $validated['name']), 0, 3));
            if (strlen($prefix) < 3) $prefix = str_pad($prefix, 3, 'X');
            $randomCode = strtoupper(substr(uniqid(), -4));
            $customId = $prefix . '-' . $randomCode;

            $school = School::create([
                'id'              => $customId,
                'name'            => $validated['name'],
                'domain'          => $validated['domain'],
                'school_type'     => $validated['school_type'],
                'phone'           => $validated['phone'] ?? null,
                'address'         => $validated['address'] ?? null,
                'deployment_date' => $validated['deployment_date'] ?? null,
                'admin_email'     => $validated['admin_email'],
                'plan'            => $validated['plan'],
                'status'          => 'Active',
            ]);

            User::create([
                'name'      => 'School Admin',
                'email'     => $validated['admin_email'],
                'password'  => Hash::make('password'), // School admin must change on first login
                'school_id' => $school->id,
                'role'      => 'school_admin',
            ]);

            $priceMap = ['Basic' => 99, 'Standard' => 249, 'Enterprise' => 499];
            Subscription::create([
                'school_id'         => $school->id,
                'plan_name'         => $validated['plan'],
                'amount'            => $priceMap[$validated['plan']],
                'period'            => 'monthly',
                'status'            => 'Active',
                'next_billing_date' => now()->addMonth(),
            ]);

            return response()->json([
                'message' => 'School provisioned successfully.',
                'school'  => $school->load('subscription'),
            ], 201);
        });
    }

    public function update(Request $request, $id)
    {
        $school = School::withoutGlobalScopes()->findOrFail($id);

        $validated = $request->validate([
            'name'            => 'sometimes|string',
            'domain'          => 'sometimes|string|unique:schools,domain,' . $id,
            'school_type'     => 'sometimes|string|in:Kindergarten,Primary (CBC),Junior School,Senior School,Hybrid',
            'phone'           => 'sometimes|nullable|string',
            'address'         => 'sometimes|nullable|string',
            'deployment_date' => 'sometimes|nullable|date',
            'admin_email'     => 'sometimes|email',
            'plan'            => 'sometimes|in:Basic,Standard,Enterprise',
            'status'          => 'sometimes|in:Active,Suspended,Trial',
            'logo_path'       => 'sometimes|nullable|string',
            'storage_limit_mb'=> 'sometimes|numeric|min:0',
        ]);

        $school->update($validated);

        return response()->json([
            'message' => 'School updated successfully.',
            'school'  => $school->fresh('subscription'),
        ]);
    }

    public function destroy($id)
    {
        $school = School::withoutGlobalScopes()->findOrFail($id);

        DB::transaction(function () use ($school) {
            // Explicit cascade — safe even before FK migration runs
            $school->users()->delete();
            $school->subscription()->delete();
            $school->delete();
        });

        return response()->json(['message' => 'School deleted successfully.']);
    }
}
