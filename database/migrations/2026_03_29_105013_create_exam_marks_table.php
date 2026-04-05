<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExamMarksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('exam_marks', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->string('subject_name');
            $table->decimal('marks', 5, 2)->default(0);
            $table->decimal('out_of', 5, 2)->default(100);
            $table->string('grade')->nullable();      // A, B+, C, etc.
            $table->string('remarks')->nullable();    // Excellent, Good, etc.
            $table->unsignedTinyInteger('term');      // 1, 2, or 3
            $table->unsignedSmallInteger('year');
            $table->timestamps();
            $table->unique(['student_id', 'exam_id', 'subject_name'], 'unique_mark');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('exam_marks');
    }
}
