<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStaffDocumentsTable extends Migration
{
    public function up()
    {
        Schema::create('staff_documents', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('document_type')->nullable(); // e.g. Contract, Certificate, ID, License
            $table->string('file_path');
            $table->string('file_name')->nullable();
            $table->date('expiry_date')->nullable();
            $table->unsignedSmallInteger('expiry_alert_days')->default(30);
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('staff_documents');
    }
}
