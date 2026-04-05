<?php

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\TeacherComment;
use Illuminate\Http\Request;

class EngagementController extends Controller
{
    public function index()
    {
        $user     = auth()->user();
        $email    = $user->email;
        $schoolId = $user->school_id;

        $children = Student::where('school_id', $schoolId)
            ->where('parent_email', $email)
            ->where('status', 'Active')
            ->pluck('id');

        $comments = TeacherComment::where('school_id', $schoolId)
            ->whereIn('student_id', $children)
            ->with(['teacher:id,name', 'student:id,first_name,last_name'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($c) => [
                'id'          => $c->id,
                'student'     => $c->student ? ($c->student->first_name . ' ' . $c->student->last_name) : '',
                'teacher'     => $c->teacher?->name ?? 'Teacher',
                'comment'     => $c->comment,
                'category'    => $c->category,
                'is_read'     => (bool)$c->is_read_by_parent,
                'date'        => $c->created_at->toDateString(),
            ]);

        // Mark all as read
        TeacherComment::where('school_id', $schoolId)
            ->whereIn('student_id', $children)
            ->where('is_read_by_parent', false)
            ->update(['is_read_by_parent' => true]);

        return response()->json(['comments' => $comments]);
    }
}
