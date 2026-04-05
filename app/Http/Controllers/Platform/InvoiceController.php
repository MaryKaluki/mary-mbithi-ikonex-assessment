<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoice;

class InvoiceController extends Controller
{
    public function index()
    {
        // For a true multi-tenant system, platform admin sees all invoices.
        $invoices = Invoice::with('school')->orderBy('due_date', 'asc')->get();
        return response()->json($invoices);
    }
}
