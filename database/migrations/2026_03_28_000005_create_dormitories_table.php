<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDormitoriesTable extends Migration
{
    public function up()
    {
        Schema::create('dormitories', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['Boys', 'Girls', 'Junior Boys', 'Junior Girls', 'Mixed']);
            $table->integer('capacity')->default(100);
            $table->unsignedBigInteger('warden_id')->nullable();
            $table->foreign('warden_id')->references('id')->on('users')->nullOnDelete();
            $table->enum('status', ['Active', 'Full', 'Closed'])->default('Active');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('dormitories');
    }
}
