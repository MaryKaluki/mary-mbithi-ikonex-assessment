<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BudgetCategory;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function index()
    {
        return response()->json(BudgetCategory::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'allocated' => 'required|numeric|min:0',
            'actual'    => 'nullable|numeric|min:0',
            'color'     => 'nullable|string',
        ]);

        $budget = BudgetCategory::create([
            'name'      => $validated['name'],
            'allocated' => $validated['allocated'],
            'actual'    => $validated['actual'] ?? 0,
            'color'     => $validated['color'] ?? 'bg-purple-500',
        ]);

        return response()->json($budget, 201);
    }

    public function update(Request $request, $id)
    {
        $budget = BudgetCategory::findOrFail($id);

        $validated = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'allocated' => 'sometimes|numeric|min:0',
            'actual'    => 'sometimes|numeric|min:0',
            'color'     => 'sometimes|string',
        ]);

        $budget->update($validated);

        return response()->json($budget);
    }

    public function destroy($id)
    {
        BudgetCategory::findOrFail($id)->delete();
        return response()->json(['message' => 'Budget category deleted.']);
    }
}
