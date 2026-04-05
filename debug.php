<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "School Count: " . \App\Models\School::withoutGlobalScopes()->count() . PHP_EOL;
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}
