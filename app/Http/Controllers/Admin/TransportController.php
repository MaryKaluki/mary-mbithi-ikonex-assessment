<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\TransportRoute;
use Illuminate\Http\Request;

class TransportController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_buses'    => Vehicle::count(),
            'active_routes'  => TransportRoute::where('status', 'Active')->count(),
            'total_drivers'  => \App\Models\User::where('role', 'driver')->count(),
            'in_maintenance' => Vehicle::where('status', 'Maintenance')->count(),
        ]);
    }

    public function routes()
    {
        $routes = TransportRoute::with(['vehicle', 'driver'])
            ->orderBy('name')
            ->get()
            ->map(function ($route) {
                return [
                    'id'           => $route->id,
                    'name'         => $route->name,
                    'driver'       => $route->driver ? $route->driver->name : 'Unassigned',
                    'plate'        => $route->vehicle ? $route->vehicle->plate_number : 'N/A',
                    'capacity'     => $route->vehicle ? $route->vehicle->capacity : 0,
                    'status'       => $route->status,
                ];
            });

        return response()->json($routes);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:150',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'driver_id'  => 'nullable|exists:users,id',
            'status'     => 'nullable|in:Active,In Transit,Arrived,Delayed,Inactive',
        ]);

        $route = TransportRoute::create($data);
        return response()->json($route, 201);
    }

    public function update(Request $request, $id)
    {
        $route = TransportRoute::findOrFail($id);

        $data = $request->validate([
            'name'       => 'sometimes|string|max:150',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'driver_id'  => 'nullable|exists:users,id',
            'status'     => 'nullable|in:Active,In Transit,Arrived,Delayed,Inactive',
        ]);

        $route->update($data);
        return response()->json($route);
    }
    
    public function destroy($id)
    {
        $route = TransportRoute::findOrFail($id);
        $route->delete();
        return response()->json(['message' => 'Route deleted']);
    }

    // --- Vehicles Management ---

    public function vehicles()
    {
        return response()->json(Vehicle::orderBy('plate_number')->get());
    }

    public function storeVehicle(Request $request)
    {
        $data = $request->validate([
            'plate_number' => 'required|string|max:50',
            'make'         => 'nullable|string|max:100',
            'model'        => 'nullable|string|max:100',
            'capacity'     => 'required|integer|min:1',
            'status'       => 'nullable|in:Active,Maintenance,Retired',
        ]);

        $vehicle = Vehicle::create($data);
        return response()->json($vehicle, 201);
    }

    public function updateVehicle(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $data = $request->validate([
            'plate_number' => 'sometimes|string|max:50',
            'make'         => 'nullable|string|max:100',
            'model'        => 'nullable|string|max:100',
            'capacity'     => 'sometimes|integer|min:1',
            'status'       => 'nullable|in:Active,Maintenance,Retired',
        ]);

        $vehicle->update($data);
        return response()->json($vehicle);
    }

    public function destroyVehicle($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();
        return response()->json(['message' => 'Vehicle deleted']);
    }

    // --- Drivers ---

    public function drivers()
    {
        $drivers = \App\Models\User::where('role', 'driver')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();
        return response()->json($drivers);
    }

    // --- Manifest / Students ---

    public function routeStudents($id)
    {
        $route = TransportRoute::findOrFail($id);
        $students = $route->students()
            ->with('schoolClass')
            ->orderBy('first_name')
            ->get()
            ->map(function($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->first_name . ' ' . $s->last_name,
                    'class' => $s->schoolClass ? $s->schoolClass->name : 'N/A',
                    'emergency_contact' => $s->secondary_parent_phone ?: $s->parent_phone,
                ];
            });
            
        return response()->json($students);
    }

    public function assignStudentsToRoute(Request $request, $id)
    {
        $route = TransportRoute::findOrFail($id);
        
        $data = $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id'
        ]);

        // Clear existing students on this route (optional, but standard for massive assignment overrides)
        // Wait, normally we just update the students sent
        // Actually, if we do a full sync, we null out previous:
        // \App\Models\Student::where('transport_route_id', $route->id)->update(['transport_route_id' => null]);
        
        // Let's just assign the provided ones:
        \App\Models\Student::whereIn('id', $data['student_ids'])
            ->update(['transport_route_id' => $route->id, 'mode_of_transport' => 'School Bus']);
            
        return response()->json(['message' => 'Students assigned to route successfully']);
    }

    // ─── Phase 5A: Transport Billing ─────────────────────────────────────────

    /**
     * GET /api/admin/transport/billing
     * Overview of all routes with their fee_per_term and assigned student count.
     */
    public function billingOverview(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $routes = \Illuminate\Support\Facades\DB::table('transport_routes as r')
            ->where('r.school_id', $schoolId)
            ->leftJoin('students as s', function ($j) {
                $j->on('s.transport_route_id', '=', 'r.id')
                  ->where('s.status', '=', 'Active');
            })
            ->select([
                'r.id', 'r.name', 'r.status',
                'r.fee_per_term', 'r.pickup_point',
                \Illuminate\Support\Facades\DB::raw('COUNT(s.id) as student_count'),
                \Illuminate\Support\Facades\DB::raw('COUNT(s.id) * r.fee_per_term as total_expected_kes'),
            ])
            ->groupBy('r.id', 'r.name', 'r.status', 'r.fee_per_term', 'r.pickup_point')
            ->orderBy('r.name')
            ->get();

        $summary = [
            'total_routes'      => $routes->count(),
            'total_students'    => $routes->sum('student_count'),
            'total_expected_kes'=> $routes->sum('total_expected_kes') / 100,
        ];

        return response()->json(['data' => $routes, 'summary' => $summary]);
    }

    /**
     * PATCH /api/admin/transport/routes/{id}/fee
     * Body: { fee_per_term: integer (in KES), pickup_point?: string }
     */
    public function updateRouteFee(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;
        $route    = TransportRoute::where('id', $id)
            ->where('school_id', $schoolId)->firstOrFail();

        $data = $request->validate([
            'fee_per_term' => 'required|integer|min:0',
            'pickup_point' => 'nullable|string|max:255',
        ]);

        // Store as integer KES (not cents — transport fees are typically whole shillings)
        $route->update([
            'fee_per_term' => $data['fee_per_term'],
            'pickup_point' => $data['pickup_point'] ?? $route->pickup_point,
        ]);

        return response()->json([
            'message'      => 'Transport fee updated.',
            'fee_per_term' => $route->fee_per_term,
        ]);
    }
}
