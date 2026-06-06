<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePettyCashTransactionsTable extends Migration
{
    public function up()
    {
        Schema::create('petty_cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->unsignedBigInteger('account_id');
            $table->enum('type', ['top_up', 'expense', 'reimbursement']);
            $table->unsignedInteger('amount'); // KES integer — always positive
            $table->string('description');
            $table->string('reference', 64)->nullable();
            $table->unsignedBigInteger('expense_id')->nullable(); // links to expenses table for expense type
            $table->date('transaction_date');
            $table->unsignedBigInteger('recorded_by')->nullable();
            $table->integer('balance_after')->default(0); // snapshot balance after this tx
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('account_id')->references('id')->on('petty_cash_accounts')->onDelete('cascade');
            $table->foreign('expense_id')->references('id')->on('expenses')->onDelete('set null');
            $table->foreign('recorded_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['school_id', 'account_id'], 'pct_school_account');
            $table->index(['school_id', 'transaction_date'], 'pct_school_date');
        });
    }

    public function down()
    {
        Schema::dropIfExists('petty_cash_transactions');
    }
}
