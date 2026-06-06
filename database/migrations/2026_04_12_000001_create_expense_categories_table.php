<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExpenseCategoriesTable extends Migration
{
    public function up()
    {
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->string('name');
            $table->string('code', 32)->nullable();
            $table->unsignedInteger('budget_monthly')->default(0); // KES integer
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('parent_id')->references('id')->on('expense_categories')->onDelete('set null');

            $table->index(['school_id', 'is_active'], 'ec_school_active');
            $table->unique(['school_id', 'code'], 'ec_school_code');
        });
    }

    public function down()
    {
        Schema::dropIfExists('expense_categories');
    }
}
