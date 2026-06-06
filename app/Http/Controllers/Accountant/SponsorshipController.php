<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SponsorshipController extends Controller
{
    /** GET /api/finance/sponsorships */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $query = DB::table('sponsorships as sp')
            ->where('sp.school_id', $schoolId)
            ->whereNull('sp.deleted_at')
            ->join('students as s', 's.id', '=', 'sp.student_id')
            ->select('sp.*', 's.first_name', 's.last_name', 's.admission_number', 's.grade_level')
            ->orderByDesc('sp.active')
            ->orderBy('sp.sponsor_name');

        if ($request->filled('active'))     $query->where('sp.active', $request->boolean('active'));
        if ($request->filled('student_id')) $query->where('sp.student_id', $request->student_id);

        return response()->json($query->get());
    }

    /** POST /api/finance/sponsorships */
    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id'      => 'required|integer',
            'sponsor_name'    => 'required|string|max:255',
            'sponsor_contact' => 'nullable|string|max:255',
            'amount_per_term' => 'required|integer|min:1',
            'covers'          => 'nullable|string',
            'start_term'      => 'nullable|integer|in:1,2,3',
            'start_year'      => 'nullable|string|max:10',
            'end_term'        => 'nullable|integer|in:1,2,3',
            'end_year'        => 'nullable|string|max:10',
            'notes'           => 'nullable|string',
        ]);

        $schoolId = $request->user()->school_id;

        $id = DB::table('sponsorships')->insertGetId(array_merge($data, [
            'school_id'  => $schoolId,
            'active'     => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]));

        return response()->json(DB::table('sponsorships')->where('id', $id)->first(), 201);
    }

    /** PUT /api/finance/sponsorships/{id} */
    public function update(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;
        $data = $request->validate([
            'sponsor_name'    => 'sometimes|string|max:255',
            'sponsor_contact' => 'nullable|string',
            'amount_per_term' => 'sometimes|integer|min:1',
            'covers'          => 'nullable|string',
            'end_term'        => 'nullable|integer|in:1,2,3',
            'end_year'        => 'nullable|string|max:10',
            'active'          => 'boolean',
            'notes'           => 'nullable|string',
        ]);

        DB::table('sponsorships')
            ->where('id', $id)
            ->where('school_id', $schoolId)
            ->update(array_merge($data, ['updated_at' => now()]));

        return response()->json(DB::table('sponsorships')->where('id', $id)->first());
    }

    /** DELETE /api/finance/sponsorships/{id} */
    public function destroy(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;
        DB::table('sponsorships')
            ->where('id', $id)
            ->where('school_id', $schoolId)
            ->update(['active' => false, 'deleted_at' => now()]);

        return response()->json(['message' => 'Sponsorship deactivated.']);
    }
}
