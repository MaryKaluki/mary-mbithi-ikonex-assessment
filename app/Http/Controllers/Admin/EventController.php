<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolEvent;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->query('month') ?: now()->month;
        $year  = $request->query('year')  ?: now()->year;

        $events = SchoolEvent::whereYear('start_date', $year)
            ->whereMonth('start_date', $month)
            ->orderBy('start_date')
            ->get()
            ->map(function ($evt) {
                return [
                    'id'          => $evt->id,
                    'title'       => $evt->title,
                    'type'        => $evt->type,
                    'start_date'  => $evt->start_date->format('Y-m-d'),
                    'end_date'    => $evt->end_date ? $evt->end_date->format('Y-m-d') : null,
                    'description' => $evt->description,
                    'day'         => (int) $evt->start_date->format('j'),
                ];
            });

        return response()->json($events);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:200',
            'type'        => 'required|in:Academic,Holiday,Sports,Cultural,Meeting,Other',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
        ]);

        return response()->json(SchoolEvent::create($data), 201);
    }

    public function update(Request $request, $id)
    {
        $event = SchoolEvent::findOrFail($id);

        $data = $request->validate([
            'title'       => 'sometimes|string|max:200',
            'type'        => 'sometimes|in:Academic,Holiday,Sports,Cultural,Meeting,Other',
            'start_date'  => 'sometimes|date',
            'end_date'    => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        $event->update($data);
        return response()->json($event);
    }

    public function destroy($id)
    {
        SchoolEvent::findOrFail($id)->delete();
        return response()->json(['message' => 'Event deleted.']);
    }
}
