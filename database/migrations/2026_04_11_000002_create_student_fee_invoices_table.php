<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStudentFeeInvoicesTable extends Migration
{
    public function up()
    {
        Schema::create('student_fee_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');                     // varchar — matches schools.id
            $table->unsignedBigInteger('student_id');
            $table->string('invoice_number')->unique();       // KASEE-INV-2026-T1-00042
            $table->string('academic_year', 10);             // "2026"
            $table->tinyInteger('term');                     // 1 | 2 | 3
            $table->unsignedBigInteger('fee_structure_id')->nullable();
            $table->unsignedBigInteger('total_charged')->default(0);   // integer KES
            $table->unsignedBigInteger('total_paid')->default(0);
            $table->bigInteger('balance')->default(0);       // can be negative (overpaid)
            $table->enum('status', ['draft', 'issued', 'partial', 'paid', 'overpaid', 'cancelled'])->default('draft');
            $table->timestamp('issued_at')->nullable();
            $table->date('due_date')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('fee_structure_id')->references('id')->on('fee_structures')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['school_id', 'student_id', 'academic_year', 'term'], 'sfi_school_student_year_term');
            $table->index(['school_id', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('student_fee_invoices');
    }
}
