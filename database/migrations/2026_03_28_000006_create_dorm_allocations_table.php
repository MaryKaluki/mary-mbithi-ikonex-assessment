<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDormAllocationsTable extends Migration
{
    public function up()
    {
        Schema::create('dorm_allocations', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->unsignedBigInteger('dormitory_id');
            $table->foreign('dormitory_id')->references('id')->on('dormitories')->cascadeOnDelete();
            $table->unsignedBigInteger('student_id');
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->string('room_number')->nullable();
            $table->date('assigned_date');
            $table->timestamps();
            $table->unique(['student_id']); // one dorm per student
        });
    }

    public function down()
    {
        Schema::dropIfExists('dorm_allocations');
    }
}
