<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStaffRecordsTable extends Migration
{
    public function up()
    {
        Schema::create('staff_records', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();

            // Employment
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('designation_id')->nullable()->constrained('designations')->nullOnDelete();
            $table->enum('employment_status', ['active', 'probation', 'on_leave', 'terminated', 'resigned'])->default('active');
            $table->enum('employment_type', ['permanent', 'contract', 'part_time', 'casual'])->default('permanent');
            $table->date('date_of_joining')->nullable();
            $table->date('date_of_leaving')->nullable();
            $table->date('probation_start')->nullable();
            $table->date('probation_end')->nullable();
            $table->date('contract_end_date')->nullable();

            // Salary
            $table->decimal('basic_salary', 12, 2)->default(0);
            $table->decimal('allowance', 12, 2)->default(0);

            // Statutory / ID numbers
            $table->string('id_number')->nullable();
            $table->string('kra_pin')->nullable();
            $table->string('nssf_no')->nullable();
            $table->string('shif_no')->nullable();

            // Banking
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('sort_code')->nullable();

            // Emergency contact
            $table->string('emergency_name')->nullable();
            $table->string('emergency_phone')->nullable();
            $table->string('emergency_relationship')->nullable();

            // Address & qualifications
            $table->text('current_address')->nullable();
            $table->text('permanent_address')->nullable();
            $table->text('qualifications')->nullable();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('staff_records');
    }
}
