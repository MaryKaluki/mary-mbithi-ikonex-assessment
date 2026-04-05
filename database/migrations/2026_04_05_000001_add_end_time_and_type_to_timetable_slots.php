<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddEndTimeAndTypeToTimetableSlots extends Migration
{
    public function up()
    {
        Schema::table('timetable_slots', function (Blueprint $table) {
            $table->string('end_time')->nullable()->after('time_slot');   // e.g. "08:20"
            $table->enum('timetable_type', ['personal', 'class', 'exams'])
                  ->default('personal')
                  ->after('end_time');
        });
    }

    public function down()
    {
        Schema::table('timetable_slots', function (Blueprint $table) {
            $table->dropColumn(['end_time', 'timetable_type']);
        });
    }
}
