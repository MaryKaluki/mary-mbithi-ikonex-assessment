<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFinanceCountersTable extends Migration
{
    /**
     * Per-school sequential counters for document numbers.
     * Used with SELECT FOR UPDATE to guarantee uniqueness under concurrency.
     */
    public function up()
    {
        Schema::create('finance_counters', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');                     // varchar — matches schools.id
            $table->enum('counter_type', ['receipt', 'invoice', 'expense', 'refund'])->default('receipt');
            $table->string('counter_year', 10);
            $table->unsignedBigInteger('last_number')->default(0);
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->unique(['school_id', 'counter_type', 'counter_year']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('finance_counters');
    }
}
