<?php

namespace App\Http\Controllers\ParentPortal;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\TransportRoute;

class TransportController extends Controller
{
    public function index()
    {
        $user     = auth()->user();
        $email    = $user->email;
        $schoolId = $user->school_id;

        $children = Student::where('school_id', $schoolId)
            ->where('parent_email', $email)
            ->where('status', 'Active')
            ->get();

        // Children that use School Bus
        $busChildren = $children->where('mode_of_transport', 'School Bus')->values();

        // Get school's active transport routes with vehicle + driver
        $routes = TransportRoute::where('school_id', $schoolId)
            ->whereIn('status', ['Active', 'In Transit', 'Arrived', 'Delayed'])
            ->with(['vehicle', 'driver'])
            ->get()
            ->map(fn($r) => [
                'id'           => $r->id,
                'name'         => $r->name,
                'status'       => $r->status,
                'vehicle_plate'=> $r->vehicle?->plate_number,
                'vehicle_make' => $r->vehicle ? ($r->vehicle->make . ' ' . $r->vehicle->model) : null,
                'driver_name'  => $r->driver?->name,
                'driver_phone' => $r->driver?->phone ?? null,
            ]);

        return response()->json([
            'bus_children'    => $busChildren->map(fn($s) => [
                'id'              => $s->id,
                'name'            => $s->first_name . ' ' . $s->last_name,
                'grade_level'     => $s->grade_level,
                'mode_of_transport' => $s->mode_of_transport,
            ]),
            'non_bus_children' => $children->where('mode_of_transport', '!=', 'School Bus')->values()->map(fn($s) => [
                'id'              => $s->id,
                'name'            => $s->first_name . ' ' . $s->last_name,
                'mode_of_transport' => $s->mode_of_transport,
            ]),
            'routes' => $routes,
        ]);
    }
}
