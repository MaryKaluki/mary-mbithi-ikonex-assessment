<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDocumentsTable extends Migration
{
    public function up()
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->string('name');
            $table->string('file_path');
            $table->string('mime_type')->nullable();
            $table->bigInteger('size_bytes')->default(0);
            $table->enum('category', ['Policies', 'Exams', 'Finance', 'HR', 'General'])->default('General');
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->foreign('uploaded_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('documents');
    }
}
