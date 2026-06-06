<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFeeStructureItemsTable extends Migration
{
    public function up()
    {
        Schema::create('fee_structure_items', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');                     // varchar — matches schools.id
            $table->unsignedBigInteger('fee_structure_id');
            $table->string('name');                          // "Tuition Fee", "Activity Levy"
            $table->unsignedBigInteger('amount');            // integer KES (no floats)
            $table->boolean('is_optional')->default(false);
            $table->boolean('is_recurring')->default(true);  // each term vs once-off
            $table->enum('applicable_to', ['all', 'boarding', 'day', 'grade'])->default('all');
            $table->string('applicable_grade')->nullable();  // e.g. "Form 1", "Grade 4"
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('fee_structure_id')->references('id')->on('fee_structures')->onDelete('cascade');
            $table->index(['school_id', 'fee_structure_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('fee_structure_items');
    }
}
