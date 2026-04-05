<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePayslipsTable extends Migration
{
    public function up()
    {
        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');   // 1-12

            // Earnings
            $table->decimal('basic_salary', 12, 2)->default(0);
            $table->decimal('allowance', 12, 2)->default(0);
            $table->decimal('gross_salary', 12, 2)->default(0);

            // Statutory deductions
            $table->decimal('nssf', 12, 2)->default(0);
            $table->decimal('shif', 12, 2)->default(0);
            $table->decimal('housing_levy', 12, 2)->default(0);
            $table->decimal('paye', 12, 2)->default(0);

            // Net
            $table->decimal('total_deductions', 12, 2)->default(0);
            $table->decimal('net_salary', 12, 2)->default(0);

            $table->enum('status', ['Draft', 'Processed', 'Paid'])->default('Draft');
            $table->foreignId('generated_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'user_id', 'year', 'month'], 'payslip_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payslips');
    }
}
