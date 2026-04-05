<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\School;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

try {
    $school = School::create([
        'id' => 'KAS-ACADEMY',
        'name' => 'KASEE ACADEMY',
        'admin_email' => 'admin@kasee.sc.ke',
        'phone' => '+254700000000',
        'domain' => 'kasee',
        'status' => 'Active',
        'school_type' => 'Hybrid'
    ]);
    
    User::create([
        'name' => 'KASEE Admin',
        'email' => 'admin@kasee.sc.ke',
        'password' => Hash::make('password'),
        'role' => 'school_admin',
        'school_id' => $school->id,
    ]);
    
    echo "School and Admin created successfully!" . PHP_EOL;
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}
