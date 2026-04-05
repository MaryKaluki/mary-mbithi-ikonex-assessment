<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTeacherTables extends Migration
{
    public function up()
    {
        // Attendance records per student per day
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('class_id');
            $table->unsignedBigInteger('marked_by'); // teacher user_id
            $table->date('date');
            $table->enum('status', ['Present', 'Late', 'Absent', 'Excused'])->default('Present');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'student_id', 'class_id', 'date'], 'attend_unique');
            $table->index(['school_id', 'class_id', 'date']);

            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->foreign('marked_by')->references('id')->on('users');
        });

        // Homework / assignments
        Schema::create('homeworks', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->unsignedBigInteger('teacher_id');
            $table->unsignedBigInteger('class_id')->nullable();
            $table->string('subject_name', 100);
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('due_date');
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->foreign('teacher_id')->references('id')->on('users')->cascadeOnDelete();
        });

        // Leave requests
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('type', ['Annual', 'Sick', 'Emergency', 'Maternity', 'Paternity', 'Other'])->default('Annual');
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedTinyInteger('days')->default(1);
            $table->text('reason');
            $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->text('admin_note')->nullable();
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down()
    {
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('homeworks');
        Schema::dropIfExists('attendances');
    }
}
