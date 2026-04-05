<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

$school = App\Models\School::first();
if (!$school) {
    echo "Error: No school found in DB.";
    exit;
}

$driver = App\Models\User::firstOrCreate(
    ['email' => 'driver@skullu.com'],
    [
        'name' => 'John The Driver',
        'password' => bcrypt('password'),
        'role' => 'driver',
        'school_id' => $school->id
    ]
);

echo "Email: " . $driver->email . "\n";
echo "Password: password\n";
