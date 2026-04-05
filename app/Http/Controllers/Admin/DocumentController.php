<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Document::with(['uploader', 'visibleTo'])->orderBy('created_at', 'desc');

        if ($request->filled('category') && $request->category !== 'All Files') {
            $query->where('category', $request->category);
        }

        // Apply visibility rules if user is a teacher
        if ($user->role === 'teacher') {
            $query->where(function ($q) use ($user) {
                $q->where('uploaded_by', $user->id) // Own documents
                  ->orWhere('visibility_type', 'all_teachers') // Shared globally
                  ->orWhere('visible_to_user_id', $user->id); // Shared specifically with this teacher
            });
        }

        $docs = $query->get()->map(function ($doc) {
            return [
                'id'         => $doc->id,
                'name'       => $doc->name,
                'type'       => $this->getExtension($doc->mime_type),
                'size'       => $this->formatSize($doc->size_bytes),
                'date'       => $doc->created_at->format('M d, Y'),
                'owner'      => $doc->uploader ? trim($doc->uploader->first_name . ' ' . $doc->uploader->last_name) : 'System',
                'owner_id'   => $doc->uploaded_by,
                'category'   => $doc->category,
                'visibility' => $doc->visibility_type === 'specific_teacher' && $doc->visibleTo 
                                ? 'Shared: ' . trim($doc->visibleTo->first_name . ' ' . $doc->visibleTo->last_name) 
                                : 'All Teachers',
                'url'        => Storage::url($doc->file_path),
            ];
        });

        // Add quota information
        $school = School::find($user->school_id);
        $usedStorage = $school->usedStorageMB();
        $limit = $school->storage_limit_mb;

        return response()->json([
            'documents' => $docs,
            'quota' => [
                'used_mb'  => $usedStorage,
                'limit_mb' => $limit,
                'percent'  => $limit > 0 ? min(100, round(($usedStorage / $limit) * 100)) : 0
            ]
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $school = School::find($user->school_id);

        $request->validate([
            'file'               => 'required|file|max:20480|mimes:pdf,doc,docx,xls,xlsx,csv,png,jpg,jpeg', // 20MB limit and safe types
            'category'           => 'required|in:Policies,Exams,Finance,HR,General',
            'visibility_type'    => 'required|in:all_teachers,specific_teacher',
            'visible_to_user_id' => 'required_if:visibility_type,specific_teacher|nullable|exists:users,id',
        ]);

        $file = $request->file('file');
        
        // Quota check
        $upcomingSizeMB = $file->getSize() / 1048576;
        if ($school->storage_limit_mb > 0 && ($school->usedStorageMB() + $upcomingSizeMB) > $school->storage_limit_mb) {
            return response()->json(['message' => 'School storage quota exceeded. Upgrade plan or clear files.'], 403);
        }

        $path = $file->store('documents', 'public');

        $doc = Document::create([
            'school_id'          => $school->id,
            'name'               => $file->getClientOriginalName(),
            'file_path'          => $path,
            'mime_type'          => $file->getMimeType(),
            'size_bytes'         => $file->getSize(),
            'category'           => $request->category,
            'uploaded_by'        => $user->id,
            'visibility_type'    => $request->visibility_type,
            'visible_to_user_id' => $request->visibility_type === 'specific_teacher' ? $request->visible_to_user_id : null,
        ]);

        return response()->json($doc, 201);
    }

    public function destroy($id)
    {
        $user = auth()->user();
        $doc = Document::findOrFail($id);

        // Security: teachers can only delete their own files
        if ($user->role === 'teacher' && $doc->uploaded_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized deletion.'], 403);
        }

        Storage::disk('public')->delete($doc->file_path);
        $doc->delete();
        return response()->json(['message' => 'Document deleted.']);
    }

    // Helper function to return user list for sharing
    public function getTeachers()
    {
        $user = auth()->user();
        $teachers = User::where('school_id', $user->school_id)
            ->where('id', '!=', $user->id)
            ->whereIn('role', ['teacher', 'school_admin'])
            ->get()
            ->map(function($t) {
                return [
                    'id' => $t->id,
                    'name' => trim($t->first_name . ' ' . $t->last_name . ' (' . ucfirst($t->role) . ')')
                ];
            });
            
        return response()->json($teachers);
    }

    private function getExtension($mimeType)
    {
        $map = [
            'application/pdf'                                                          => 'pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'       => 'xls',
            'application/vnd.ms-excel'                                                 => 'xls',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'doc',
            'application/msword'                                                       => 'doc',
            'image/jpeg'                                                               => 'jpg',
            'image/png'                                                                => 'png',
            'text/csv'                                                                 => 'csv',
        ];
        return $map[$mimeType] ?? 'file';
    }

    private function formatSize($bytes)
    {
        if ($bytes >= 1048576) return round($bytes / 1048576, 1) . ' MB';
        if ($bytes >= 1024)    return round($bytes / 1024, 1) . ' KB';
        return $bytes . ' B';
    }
}
