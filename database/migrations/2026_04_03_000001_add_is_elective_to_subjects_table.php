<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIsElectiveToSubjectsTable extends Migration
{
    public function up()
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->boolean('is_elective')->default(false)->after('grade_levels');
        });
    }

    public function down()
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn('is_elective');
        });
    }
}
