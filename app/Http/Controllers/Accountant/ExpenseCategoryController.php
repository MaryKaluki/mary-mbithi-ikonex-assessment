<?php

namespace App\Http\Controllers\Accountant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseCategoryController extends Controller
{
    /** GET /api/finance/expense-categories */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $categories = DB::table('expense_categories')
            ->where('school_id', $schoolId)
            ->where('is_active', true)
            ->orderBy('parent_id')
            ->orderBy('name')
            ->get();

        // Attach actual YTD spend per category
        $year = $request->input('year', date('Y'));
        $spent = DB::table('expenses')
            ->where('school_id', $schoolId)
            ->whereIn('status', ['approved', 'paid'])
            ->whereYear('expense_date', $year)
            ->groupBy('category_id')
            ->pluck(DB::raw('SUM(amount)'), 'category_id');

        $categories = $categories->map(function ($cat) use ($spent) {
            $cat->ytd_spent = (int) ($spent[$cat->id] ?? 0);
            return $cat;
        });

        return response()->json($categories);
    }

    /** POST /api/finance/expense-categories */
    public function store(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $data = $request->validate([
            'name'           => 'required|string|max:100',
            'code'           => 'nullable|string|max:32',
            'budget_monthly' => 'nullable|integer|min:0',
            'parent_id'      => 'nullable|integer',
        ]);

        // Verify parent belongs to same school
        if (!empty($data['parent_id'])) {
            $exists = DB::table('expense_categories')
                ->where('id', $data['parent_id'])
                ->where('school_id', $schoolId)
                ->exists();
            if (!$exists) {
                return response()->json(['message' => 'Invalid parent category.'], 422);
            }
        }

        // Unique code check
        if (!empty($data['code'])) {
            $exists = DB::table('expense_categories')
                ->where('school_id', $schoolId)
                ->where('code', $data['code'])
                ->exists();
            if ($exists) {
                return response()->json(['message' => 'Category code already in use.'], 422);
            }
        }

        $id = DB::table('expense_categories')->insertGetId([
            'school_id'      => $schoolId,
            'name'           => $data['name'],
            'code'           => $data['code'] ?? null,
            'budget_monthly' => $data['budget_monthly'] ?? 0,
            'parent_id'      => $data['parent_id'] ?? null,
            'is_active'      => true,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return response()->json(DB::table('expense_categories')->find($id), 201);
    }

    /** PUT /api/finance/expense-categories/{id} */
    public function update(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $category = DB::table('expense_categories')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$category) {
            return response()->json(['message' => 'Category not found.'], 404);
        }

        $data = $request->validate([
            'name'           => 'sometimes|string|max:100',
            'code'           => 'nullable|string|max:32',
            'budget_monthly' => 'nullable|integer|min:0',
            'parent_id'      => 'nullable|integer',
            'is_active'      => 'sometimes|boolean',
        ]);

        DB::table('expense_categories')->where('id', $id)->update(
            array_merge($data, ['updated_at' => now()])
        );

        return response()->json(DB::table('expense_categories')->find($id));
    }

    /** DELETE /api/finance/expense-categories/{id} */
    public function destroy(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;

        $category = DB::table('expense_categories')
            ->where('id', $id)->where('school_id', $schoolId)->first();
        if (!$category) {
            return response()->json(['message' => 'Category not found.'], 404);
        }

        $hasExpenses = DB::table('expenses')->where('category_id', $id)->exists();
        if ($hasExpenses) {
            // Soft-delete instead of hard delete
            DB::table('expense_categories')->where('id', $id)
                ->update(['is_active' => false, 'updated_at' => now()]);
            return response()->json(['message' => 'Category deactivated (has linked expenses).']);
        }

        DB::table('expense_categories')->where('id', $id)->delete();
        return response()->json(['message' => 'Category deleted.']);
    }
}
