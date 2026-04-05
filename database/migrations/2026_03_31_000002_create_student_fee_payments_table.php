<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStudentFeePaymentsTable extends Migration
{
    public function up()
    {
        Schema::create('student_fee_payments', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('payment_method')->default('Cash'); // Cash, M-Pesa, Bank Transfer, Cheque
            $table->string('reference')->nullable();           // M-Pesa code, bank ref, etc.
            $table->string('description')->nullable();
            $table->date('payment_date');
            $table->string('term')->nullable();
            $table->string('year')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('student_fee_payments');
    }
}
