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
}
