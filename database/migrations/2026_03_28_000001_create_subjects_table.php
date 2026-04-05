<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSubjectsTable extends Migration
{
    public function up()
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('department')->nullable();
            $table->string('curriculum_type')->default('CBC'); // CBC | 844 | Hybrid
            $table->json('grade_levels')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('subjects');
    }
}
