<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBankStatementsTable extends Migration
{
    public function up()
    {
        Schema::create('bank_statements', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->unsignedBigInteger('bank_account_id');
            $table->date('transaction_date');
            $table->date('value_date')->nullable();
            $table->string('description')->nullable();
            $table->unsignedInteger('credit')->default(0);   // KES integer — amount in
            $table->unsignedInteger('debit')->default(0);    // KES integer — amount out
            $table->integer('running_balance')->default(0);  // KES integer — may be negative
            $table->string('reference', 100)->nullable();
            $table->unsignedBigInteger('matched_payment_id')->nullable();
            $table->unsignedBigInteger('matched_expense_id')->nullable();
            $table->boolean('is_reconciled')->default(false);
            $table->timestamp('reconciled_at')->nullable();
            $table->unsignedBigInteger('reconciled_by')->nullable();
            $table->string('import_batch', 64)->nullable();   // tracks which CSV import created this
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('bank_account_id')->references('id')->on('bank_accounts')->onDelete('cascade');
            $table->foreign('matched_payment_id')->references('id')->on('fee_payments')->onDelete('set null');
            $table->foreign('matched_expense_id')->references('id')->on('expenses')->onDelete('set null');
            $table->foreign('reconciled_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['school_id', 'bank_account_id', 'transaction_date'], 'bs_school_acct_date');
            $table->index(['school_id', 'is_reconciled'], 'bs_school_reconciled');
        });
    }

    public function down()
    {
        Schema::dropIfExists('bank_statements');
    }
}
