<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStorageLimitToSchoolsTable extends Migration
{
    public function up()
    {
        Schema::table('schools', function (Blueprint $table) {
            // Default 5000 MB (approx 5GB)
            $table->unsignedBigInteger('storage_limit_mb')->default(5000)->after('status');
        });
    }

    public function down()
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn('storage_limit_mb');
        });
    }
}
