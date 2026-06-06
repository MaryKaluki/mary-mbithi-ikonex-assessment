<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeeStructureController extends Controller
{
    /** GET /api/finance/fee-structures */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $structures = DB::table('fee_structures')
            ->where('school_id', $schoolId)
            ->orderBy('name')
            ->get()
            ->map(function ($s) use ($schoolId) {
                $s->items = DB::table('fee_structure_items')
                    ->where('school_id', $schoolId)
                    ->where('fee_structure_id', $s->id)
                    ->orderBy('sort_order')
                    ->get();
                return $s;
            });

        return response()->json($structures);
    }

    /** POST /api/finance/fee-structures */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'total_amount' => 'sometimes|integer|min:0',
            'items'        => 'sometimes|array',
            'items.*.name'           => 'required|string',
            'items.*.amount'         => 'required|integer|min:0',
            'items.*.is_optional'    => 'boolean',
            'items.*.is_recurring'   => 'boolean',
            'items.*.applicable_to'  => 'in:all,boarding,day,grade',
            'items.*.applicable_grade' => 'nullable|string',
            'items.*.sort_order'     => 'integer|min:0',
        ]);

        $schoolId = $request->user()->school_id;

        $id = DB::transaction(function () use ($data, $schoolId) {
            // Compute total from items if items provided
            $total = 0;
            if (!empty($data['items'])) {
                foreach ($data['items'] as $item) {
                    if (!($item['is_optional'] ?? false)) {
                        $total += $item['amount'];
                    }
                }
            } else {
                $total = $data['total_amount'] ?? 0;
            }

            $id = DB::table('fee_structures')->insertGetId([
                'school_id'    => $schoolId,
                'name'         => $data['name'],
                'total_amount' => $total,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);

            if (!empty($data['items'])) {
                foreach ($data['items'] as $i => $item) {
                    DB::table('fee_structure_items')->insert([
                        'school_id'         => $schoolId,
                        'fee_structure_id'  => $id,
                        'name'              => $item['name'],
                        'amount'            => $item['amount'],
                        'is_optional'       => $item['is_optional']   ?? false,
                        'is_recurring'      => $item['is_recurring']  ?? true,
                        'applicable_to'     => $item['applicable_to'] ?? 'all',
                        'applicable_grade'  => $item['applicable_grade'] ?? null,
                        'sort_order'        => $item['sort_order'] ?? $i,
                        'created_at'        => now(),
                        'updated_at'        => now(),
                    ]);
                }
            }

            return $id;
        });

        return response()->json(
            DB::table('fee_structures')->where('id', $id)->first(),
            201
        );
    }

    /** GET /api/finance/fee-structures/{id} */
    public function show(Request $request, $id)
    {
        $schoolId  = $request->user()->school_id;
        $structure = DB::table('fee_structures')->where('id', $id)->where('school_id', $schoolId)->first();

        if (!$structure) return response()->json(['message' => 'Not found.'], 404);

        $structure->items = DB::table('fee_structure_items')
            ->where('fee_structure_id', $id)
            ->where('school_id', $schoolId)
            ->orderBy('sort_order')
            ->get();

        return response()->json($structure);
    }

    /** PUT /api/finance/fee-structures/{id} */
    public function update(Request $request, $id)
    {
        $schoolId  = $request->user()->school_id;
        $structure = DB::table('fee_structures')->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$structure) return response()->json(['message' => 'Not found.'], 404);

        $data = $request->validate([
            'name'   => 'sometimes|string|max:255',
            'items'  => 'sometimes|array',
            'items.*.id'             => 'sometimes|integer',
            'items.*.name'           => 'required|string',
            'items.*.amount'         => 'required|integer|min:0',
            'items.*.is_optional'    => 'boolean',
            'items.*.is_recurring'   => 'boolean',
            'items.*.applicable_to'  => 'in:all,boarding,day,grade',
            'items.*.applicable_grade' => 'nullable|string',
            'items.*.sort_order'     => 'integer|min:0',
        ]);

        DB::transaction(function () use ($id, $schoolId, $data) {
            if (isset($data['name'])) {
                DB::table('fee_structures')->where('id', $id)->update([
                    'name'       => $data['name'],
                    'updated_at' => now(),
                ]);
            }

            if (isset($data['items'])) {
                // Delete old items then re-insert
                DB::table('fee_structure_items')->where('fee_structure_id', $id)->where('school_id', $schoolId)->delete();

                $total = 0;
                foreach ($data['items'] as $i => $item) {
                    DB::table('fee_structure_items')->insert([
                        'school_id'        => $schoolId,
                        'fee_structure_id' => $id,
                        'name'             => $item['name'],
                        'amount'           => $item['amount'],
                        'is_optional'      => $item['is_optional']  ?? false,
                        'is_recurring'     => $item['is_recurring'] ?? true,
                        'applicable_to'    => $item['applicable_to'] ?? 'all',
                        'applicable_grade' => $item['applicable_grade'] ?? null,
                        'sort_order'       => $item['sort_order'] ?? $i,
                        'created_at'       => now(),
                        'updated_at'       => now(),
                    ]);
                    if (!($item['is_optional'] ?? false)) {
                        $total += $item['amount'];
                    }
                }

                DB::table('fee_structures')->where('id', $id)->update([
                    'total_amount' => $total,
                    'updated_at'   => now(),
                ]);
            }
        });

        return $this->show($request, $id);
    }

    /** DELETE /api/finance/fee-structures/{id} */
    public function destroy(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        // Safety: don't delete if invoices reference this structure
        $inUse = DB::table('student_fee_invoices')
            ->where('fee_structure_id', $id)
            ->where('school_id', $schoolId)
            ->exists();

        if ($inUse) {
            return response()->json(['message' => 'Cannot delete — this structure has issued invoices.'], 409);
        }

        DB::table('fee_structure_items')->where('fee_structure_id', $id)->where('school_id', $schoolId)->delete();
        DB::table('fee_structures')->where('id', $id)->where('school_id', $schoolId)->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
