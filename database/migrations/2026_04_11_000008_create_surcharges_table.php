<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSurchargesTable extends Migration
{
    public function up()
    {
        Schema::create('surcharges', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');                     // varchar — matches schools.id
            $table->unsignedBigInteger('invoice_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('amount');            // integer KES
            $table->enum('reason', ['late_payment', 'returned_cheque', 'custom'])->default('late_payment');
            $table->string('custom_reason')->nullable();
            $table->boolean('auto_applied')->default(false);
            $table->timestamp('applied_at')->useCurrent();
            $table->unsignedBigInteger('applied_by')->nullable();
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('invoice_id')->references('id')->on('student_fee_invoices')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('applied_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['school_id', 'invoice_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('surcharges');
    }
}
