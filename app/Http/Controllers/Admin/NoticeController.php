<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use Illuminate\Http\Request;

class NoticeController extends Controller
{
    public function index()
    {
        $notices = Notice::with('author:id,name')
            ->latest()
            ->get()
            ->map(fn($n) => [
                'id'           => $n->id,
                'title'        => $n->title,
                'content'      => $n->content,
                'type'         => $n->type,
                'author'       => $n->author?->name ?? 'System',
                'published_at' => $n->published_at?->format('M d, Y') ?? $n->created_at->format('M d, Y'),
            ]);

        return response()->json($notices);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'content'      => 'required|string',
            'type'         => 'required|in:Academic,General,Event,Finance,Health,Transport',
            'published_at' => 'nullable|date',
        ]);

        $notice = Notice::create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Notice posted successfully.',
            'notice'  => $notice,
        ], 201);
    }

    public function destroy($id)
    {
        $notice = Notice::findOrFail($id);
        $notice->delete();

        return response()->json(['message' => 'Notice deleted.']);
    }
}
