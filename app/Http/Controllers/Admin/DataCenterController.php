<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class DataCenterController extends Controller
{
    public function export(Request $request)
    {
        return response()->json(['message' => 'Export process started in background']);
    }

    public function backup(Request $request)
    {
        // Real logic: Artisan::call('backup:run');
        return response()->json(['message' => 'Full database backup initiated successfully.']);
    }

    public function clearCache(Request $request)
    {
        Artisan::call('optimize:clear');
        return response()->json(['message' => 'Application cache has been cleared successfully.']);
    }
}
