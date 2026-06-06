<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 5C — End-of-term clearance tracking.
 *
 * Tracks per-student clearance sign-offs each term; blocks exam card
 * generation if balance > configured threshold.
 */
class CreateStudentClearanceTable extends Migration
{
    public function up()
    {
        Schema::create('student_clearance', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();

            $table->unsignedBigInteger('student_id');
            $table->foreign('student_id')->references('id')->on('students')->restrictOnDelete();

            $table->string('academic_year', 10);
            $table->unsignedTinyInteger('term');  // 1 | 2 | 3

            // Department sign-offs
            $table->boolean('fee_cleared')->default(false)
                  ->comment('Finance confirms outstanding balance is within allowed threshold');
            $table->unsignedBigInteger('fee_cleared_by')->nullable();
            $table->foreign('fee_cleared_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('fee_cleared_at')->nullable();

            $table->boolean('library_cleared')->default(false)
                  ->comment('Library confirms no unreturned books or fines');
            $table->unsignedBigInteger('library_cleared_by')->nullable();
            $table->foreign('library_cleared_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('library_cleared_at')->nullable();

            $table->boolean('dorm_cleared')->default(false)
                  ->comment('Dorm warden confirms no damage / items owed');
            $table->unsignedBigInteger('dorm_cleared_by')->nullable();
            $table->foreign('dorm_cleared_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('dorm_cleared_at')->nullable();

            // Exam card
            $table->boolean('exam_card_issued')->default(false);
            $table->unsignedBigInteger('exam_card_issued_by')->nullable();
            $table->foreign('exam_card_issued_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('exam_card_issued_at')->nullable();

            // Final overall clearance sign-off
            $table->boolean('fully_cleared')->default(false);
            $table->unsignedBigInteger('clearance_signed_off_by')->nullable();
            $table->foreign('clearance_signed_off_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('signed_off_at')->nullable();

            // Snapshot of balance at time of fee-clearance decision
            $table->unsignedBigInteger('balance_at_clearance')->default(0);
            $table->unsignedBigInteger('clearance_threshold')->default(0)
                  ->comment('Max allowed balance to grant clearance (school-configured)');

            $table->text('notes')->nullable();
            $table->timestamps();

            // One clearance record per student per term/year
            $table->unique(['school_id', 'student_id', 'academic_year', 'term']);
            $table->index(['school_id', 'academic_year', 'term']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('student_clearance');
    }
}
