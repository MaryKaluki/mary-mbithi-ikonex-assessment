<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFeePaymentsTable extends Migration
{
    public function up()
    {
        Schema::create('fee_payments', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');                     // varchar — matches schools.id
            $table->unsignedBigInteger('invoice_id')->nullable();    // null = advance payment
            $table->unsignedBigInteger('student_id');
            $table->string('receipt_number')->unique();              // KASEE-RCT-2026-00142
            $table->unsignedBigInteger('amount');                    // always positive (integer KES)
            $table->enum('payment_method', [
                'cash', 'mpesa', 'bank_transfer', 'cheque', 'standing_order', 'card'
            ])->default('cash');
            $table->string('mpesa_code', 20)->nullable();
            $table->string('bank_ref', 100)->nullable();
            $table->string('cheque_number', 50)->nullable();
            $table->unsignedBigInteger('bank_account_id')->nullable();
            $table->date('payment_date');
            $table->string('academic_year', 10);
            $table->tinyInteger('term');
            $table->unsignedBigInteger('received_by')->nullable();
            $table->unsignedBigInteger('verified_by')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'bounced', 'reversed'])->default('confirmed');
            $table->unsignedBigInteger('reversal_id')->nullable();   // self-ref: which payment reversed this
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('invoice_id')->references('id')->on('student_fee_invoices')->onDelete('set null');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('received_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['school_id', 'student_id']);
            $table->index(['school_id', 'payment_date']);
            $table->index(['school_id', 'payment_method']);
            $table->index(['school_id', 'status']);
            $table->index('mpesa_code');
        });

        // Self-referential FK added after table exists
        Schema::table('fee_payments', function (Blueprint $table) {
            $table->foreign('reversal_id')->references('id')->on('fee_payments')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('fee_payments');
    }
}
