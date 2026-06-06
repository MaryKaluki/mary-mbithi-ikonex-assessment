<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChequesTable extends Migration
{
    public function up()
    {
        Schema::create('cheques', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->string('cheque_number', 50);
            $table->unsignedBigInteger('bank_account_id')->nullable(); // school's receiving account
            $table->string('drawn_on_bank', 100)->nullable();          // bank cheque is drawn on
            $table->unsignedInteger('amount');                         // KES integer
            $table->string('payer_name', 150)->nullable();
            $table->date('received_date');
            $table->date('deposit_date')->nullable();
            $table->date('cleared_date')->nullable();
            $table->enum('status', ['received', 'deposited', 'cleared', 'bounced', 'cancelled'])->default('received');
            $table->unsignedBigInteger('linked_payment_id')->nullable();
            $table->string('bounce_reason', 255)->nullable();
            $table->unsignedInteger('bounce_charges')->nullable();     // KES integer
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('bank_account_id')->references('id')->on('bank_accounts')->onDelete('set null');
            $table->foreign('linked_payment_id')->references('id')->on('fee_payments')->onDelete('set null');

            $table->index(['school_id', 'status'], 'chq_school_status');
            $table->index(['school_id', 'cheque_number'], 'chq_school_number');
        });
    }

    public function down()
    {
        Schema::dropIfExists('cheques');
    }
}
