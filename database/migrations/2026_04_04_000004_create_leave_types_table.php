<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLeaveTypesTable extends Migration
{
    public function up()
    {
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->string('name');                          // e.g. Annual Leave
            $table->boolean('is_paid')->default(true);
            $table->unsignedTinyInteger('days_allowed_per_year')->default(21);
            $table->boolean('carry_forward')->default(false);
            $table->unsignedTinyInteger('carry_forward_max')->default(0); // 0 = unlimited
            $table->boolean('requires_document')->default(false); // e.g. sick leave needs note
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->unique(['school_id', 'name']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('leave_types');
    }
}
