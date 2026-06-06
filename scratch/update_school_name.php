<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\School;

$school = School::find('KAS-ACADEMY');
if ($school) {
    $school->update(['name' => 'Ikonex Academy']);
    echo "SUCCESS: School name updated to 'Ikonex Academy'\n";
} else {
    echo "ERROR: School 'KAS-ACADEMY' not found\n";
}
