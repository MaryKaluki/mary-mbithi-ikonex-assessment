<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMpesaTransactionsTable extends Migration
{
    public function up()
    {
        Schema::create('mpesa_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->string('mpesa_receipt_number', 20)->unique(); // TransID from Safaricom
            $table->enum('transaction_type', ['c2b', 'stk_push'])->default('c2b');
            $table->unsignedInteger('amount');              // KES integer
            $table->string('phone_number', 512);            // encrypted at app layer
            $table->string('account_reference', 100)->nullable(); // student ADM number typed by payer
            $table->datetime('transaction_date');
            $table->unsignedBigInteger('matched_invoice_id')->nullable();
            $table->unsignedBigInteger('matched_payment_id')->nullable();
            $table->boolean('is_matched')->default(false);
            $table->string('match_method', 30)->nullable(); // 'auto_adm' | 'manual' | 'phone'
            $table->timestamp('matched_at')->nullable();
            $table->unsignedBigInteger('matched_by')->nullable(); // null = auto-matched
            $table->json('raw_payload')->nullable();         // full Safaricom callback JSON
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('matched_invoice_id')->references('id')->on('student_fee_invoices')->onDelete('set null');
            $table->foreign('matched_payment_id')->references('id')->on('fee_payments')->onDelete('set null');
            $table->foreign('matched_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['school_id', 'is_matched'], 'mt_school_matched');
            $table->index(['school_id', 'transaction_date'], 'mt_school_date');
            $table->index('account_reference', 'mt_account_ref');
        });
    }

    public function down()
    {
        Schema::dropIfExists('mpesa_transactions');
    }
}
