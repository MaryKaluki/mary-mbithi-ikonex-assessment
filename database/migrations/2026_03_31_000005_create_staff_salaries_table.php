<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStaffSalariesTable extends Migration
{
    public function up()
    {
        Schema::create('staff_salaries', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('gross_salary', 12, 2)->default(0);
            $table->decimal('deductions', 12, 2)->default(0);  // PAYE, NHIF, NSSF etc.
            $table->string('currency')->default('KES');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['school_id', 'user_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('staff_salaries');
    }
}
