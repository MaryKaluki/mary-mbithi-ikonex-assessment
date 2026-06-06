<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFeeReceiptsTable extends Migration
{
    public function up()
    {
        Schema::create('fee_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');                     // varchar — matches schools.id
            $table->unsignedBigInteger('payment_id');
            $table->string('receipt_number');                // denormalised for fast lookup
            $table->timestamp('printed_at')->nullable();
            $table->unsignedBigInteger('printed_by')->nullable();
            $table->timestamp('email_sent_at')->nullable();
            $table->timestamp('sms_sent_at')->nullable();
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('payment_id')->references('id')->on('fee_payments')->onDelete('cascade');
            $table->foreign('printed_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['school_id', 'receipt_number']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('fee_receipts');
    }
}
