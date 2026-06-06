<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFundTransferRequestsTable extends Migration
{
    public function up()
    {
        Schema::create('fund_transfer_requests', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->string('reference', 32)->nullable();
            $table->string('from_account_name'); // free-text until Phase 3 bank_accounts table
            $table->string('to_account_name');
            $table->unsignedInteger('amount'); // KES integer
            $table->string('reason')->nullable();
            $table->enum('status', ['pending', 'approved', 'executed', 'rejected'])->default('pending');
            $table->unsignedBigInteger('requested_by')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->string('rejection_reason')->nullable();
            $table->date('transfer_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('requested_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['school_id', 'status'], 'ftr_school_status');
            $table->unique(['school_id', 'reference'], 'ftr_school_ref');
        });
    }

    public function down()
    {
        Schema::dropIfExists('fund_transfer_requests');
    }
}
