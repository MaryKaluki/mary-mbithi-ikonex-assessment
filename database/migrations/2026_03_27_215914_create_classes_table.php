<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClassesTable extends Migration
{
    public function up()
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->string('name');                    // "Grade 7A"
            $table->string('level');                   // "Pre-Primary" | "Lower Primary" | "Upper Primary" | "Junior School" | "Senior School"
            $table->string('section')->nullable();     // "A" | "B" | "STEM" | "Arts"
            $table->string('curriculum_type')->default('CBC'); // CBC | 844 | Hybrid
            $table->unsignedBigInteger('class_teacher_id')->nullable();
            $table->foreign('class_teacher_id')->references('id')->on('users')->nullOnDelete();
            $table->integer('capacity')->default(40);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('classes');
    }
}
