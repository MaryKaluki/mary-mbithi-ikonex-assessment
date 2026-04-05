<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSchoolSettingsTable extends Migration
{
    public function up()
    {
        Schema::create('school_settings', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->string('key');
            $table->text('value')->nullable();
            $table->timestamps();
            $table->unique(['school_id', 'key']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('school_settings');
    }
}
