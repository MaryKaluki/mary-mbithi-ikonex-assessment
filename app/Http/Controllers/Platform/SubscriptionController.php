<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Subscription;

class SubscriptionController extends Controller
{
    public function index()
    {
        // For now, return active subscriptions as a proxy for invoices
        $subscriptions = Subscription::with('school')->latest()->get();
        return response()->json($subscriptions);
    }
}
