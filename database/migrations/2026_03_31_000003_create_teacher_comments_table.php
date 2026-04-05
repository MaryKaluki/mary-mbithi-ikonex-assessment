<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTeacherCommentsTable extends Migration
{
    public function up()
    {
        Schema::create('teacher_comments', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->text('comment');
            $table->enum('category', ['Positive', 'Reminder', 'Concern'])->default('Positive');
            $table->boolean('is_read_by_parent')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('teacher_comments');
    }
}
