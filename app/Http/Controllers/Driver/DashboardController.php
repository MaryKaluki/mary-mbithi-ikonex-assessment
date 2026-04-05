<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\TransportRoute;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get the driver's complete initial state.
     */
    public function index()
    {
        $driverId = auth()->id();

        $route = TransportRoute::with(['vehicle', 'students' => function($q) {
            $q->orderBy('first_name');
        }, 'students.schoolClass'])
            ->where('driver_id', $driverId)
            ->first();

        if (!$route) {
            return response()->json([
                'has_route' => false,
                'message'   => 'You are not assigned to a route today.',
            ]);
        }

        // Map students cleanly
        $students = $route->students->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->first_name . ' ' . $s->last_name,
                'admission_number' => $s->admission_number,
                'class' => $s->schoolClass ? $s->schoolClass->name : 'N/A',
                'emergency_contact' => $s->secondary_parent_phone ?: $s->parent_phone,
            ];
        });

        return response()->json([
            'has_route' => true,
            'route' => [
                'id'     => $route->id,
                'name'   => $route->name,
                'status' => $route->status,
            ],
            'vehicle' => $route->vehicle ? [
                'plate' => $route->vehicle->plate_number,
                'make'  => $route->vehicle->make,
                'model' => $route->vehicle->model,
                'capacity' => $route->vehicle->capacity,
            ] : null,
            'manifest' => $students,
        ]);
    }

    /**
     * Update the active route status (e.g. from Active to In Transit to Arrived)
     */
    public function updateStatus(Request $request)
    {
        $data = $request->validate([
            'status' => 'required|in:Active,In Transit,Arrived,Delayed,Inactive',
        ]);

        $route = TransportRoute::where('driver_id', auth()->id())->firstOrFail();
        $route->update(['status' => $data['status']]);

        return response()->json(['message' => 'Status updated successfully', 'status' => $route->status]);
    }
}
