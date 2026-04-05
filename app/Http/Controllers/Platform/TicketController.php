<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SupportTicket;

class TicketController extends Controller
{
    public function index()
    {
        $tickets = SupportTicket::with('school')->latest()->get();
        return response()->json($tickets);
    }

    public function update(Request $request, $id)
    {
        $ticket = SupportTicket::findOrFail($id);
        $ticket->status = 'Resolved';
        $ticket->save();
        return response()->json(['message' => 'Ticket Resolved']);
    }
}
