<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePayrollRecordsTable extends Migration
{
    public function up()
    {
        Schema::create('payroll_records', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('month');       // e.g. "2026-03"
            $table->decimal('gross', 12, 2)->default(0);
            $table->decimal('deductions', 12, 2)->default(0);
            $table->decimal('net', 12, 2)->default(0);
            $table->enum('status', ['Draft', 'Processed', 'Paid'])->default('Draft');
            $table->foreignId('generated_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->unique(['school_id', 'user_id', 'month']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('payroll_records');
    }
}
