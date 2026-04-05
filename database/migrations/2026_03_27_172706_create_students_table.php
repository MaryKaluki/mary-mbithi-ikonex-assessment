<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStudentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            
            // Ministry & Identification
            $table->string('admission_number')->unique();
            $table->string('nemis_upi')->unique()->nullable();
            $table->string('birth_certificate_number')->unique()->nullable();
            
            // Demographics
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->enum('gender', ['Male', 'Female', 'Other']);
            $table->date('date_of_birth');
            
            // Academic
            $table->string('grade_level');
            $table->unsignedBigInteger('fee_structure_id')->nullable();
            $table->date('admission_date');
            $table->enum('status', ['Active', 'Suspended', 'Transferred', 'Alumni', 'Inactive'])->default('Active');
            
            // Parent/Guardian Contacts
            $table->string('parent_name');
            $table->enum('parent_relationship', ['Father', 'Mother', 'Guardian', 'Other']);
            $table->string('parent_phone');
            $table->string('parent_email')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('students');
    }
}
