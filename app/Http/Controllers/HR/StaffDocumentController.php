<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\StaffDocument;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StaffDocumentController extends Controller
{
    /**
     * GET /api/hr/staff-documents/{userId}
     */
    public function index($userId)
    {
        $schoolId = auth()->user()->school_id;

        User::withoutGlobalScopes()->where('school_id', $schoolId)->findOrFail($userId);

        $documents = StaffDocument::where('school_id', $schoolId)
            ->where('user_id', $userId)
            ->with('uploadedBy:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($d) => [
                'id'                => $d->id,
                'title'             => $d->title,
                'document_type'     => $d->document_type,
                'file_name'         => $d->file_name,
                'file_url'          => asset('storage/' . $d->file_path),
                'expiry_date'       => $d->expiry_date?->toDateString(),
                'expiry_alert_days' => $d->expiry_alert_days,
                'is_expired'        => $d->is_expired,
                'is_expiring_soon'  => $d->is_expiring_soon,
                'uploaded_by'       => $d->uploadedBy->name ?? '—',
                'created_at'        => $d->created_at->toDateString(),
            ]);

        return response()->json($documents);
    }

    /**
     * POST /api/hr/staff-documents/{userId}
     */
    public function store(Request $request, $userId)
    {
        $schoolId = auth()->user()->school_id;
        $hr       = auth()->user();

        User::withoutGlobalScopes()->where('school_id', $schoolId)->findOrFail($userId);

        $data = $request->validate([
            'title'             => 'required|string|max:200',
            'document_type'     => 'nullable|string|max:100',
            'file'              => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'expiry_date'       => 'nullable|date',
            'expiry_alert_days' => 'integer|min:1|max:365',
        ]);

        $file     = $request->file('file');
        $path     = $file->store("staff-documents/{$schoolId}/{$userId}", 'public');
        $fileName = $file->getClientOriginalName();

        $doc = StaffDocument::create([
            'school_id'         => $schoolId,
            'user_id'           => $userId,
            'title'             => $data['title'],
            'document_type'     => $data['document_type'] ?? null,
            'file_path'         => $path,
            'file_name'         => $fileName,
            'expiry_date'       => $data['expiry_date']       ?? null,
            'expiry_alert_days' => $data['expiry_alert_days'] ?? 30,
            'uploaded_by'       => $hr->id,
        ]);

        return response()->json($doc, 201);
    }

    /**
     * DELETE /api/hr/staff-documents/{id}
     */
    public function destroy($id)
    {
        $schoolId = auth()->user()->school_id;

        $doc = StaffDocument::where('school_id', $schoolId)->findOrFail($id);

        Storage::disk('public')->delete($doc->file_path);
        $doc->delete();

        return response()->json(['message' => 'Document deleted.']);
    }
}
