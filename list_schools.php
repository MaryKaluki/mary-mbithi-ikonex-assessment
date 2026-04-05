<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\School;
use App\Models\User;

$schools = School::all();
echo "Total Schools Found: " . $schools->count() . PHP_EOL;
foreach($schools as $s) {
    echo "- " . $s->name . " (ID: " . $s->id . ")" . PHP_EOL;
}
