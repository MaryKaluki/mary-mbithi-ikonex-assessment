<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStudentDiscountsTable extends Migration
{
    public function up()
    {
        Schema::create('student_discounts', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');                     // varchar — matches schools.id
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('invoice_id')->nullable(); // null = global discount
            $table->enum('discount_type', [
                'scholarship', 'sibling', 'staff_child', 'bursary', 'sponsorship', 'custom'
            ])->default('custom');
            $table->unsignedBigInteger('amount_or_pct');   // integer: KES or 1–100
            $table->boolean('is_percentage')->default(false);
            $table->string('reason')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('invoice_id')->references('id')->on('student_fee_invoices')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['school_id', 'student_id', 'active']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('student_discounts');
    }
}
