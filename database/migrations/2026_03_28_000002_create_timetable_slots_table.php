<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTimetableSlotsTable extends Migration
{
    public function up()
    {
        Schema::create('timetable_slots', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->unsignedBigInteger('class_id');
            $table->foreign('class_id')->references('id')->on('classes')->cascadeOnDelete();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->foreign('subject_id')->references('id')->on('subjects')->nullOnDelete();
            $table->unsignedBigInteger('teacher_id')->nullable();
            $table->foreign('teacher_id')->references('id')->on('users')->nullOnDelete();
            $table->enum('day', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
            $table->string('time_slot'); // e.g. "08:00"
            $table->boolean('is_break')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('timetable_slots');
    }
}
