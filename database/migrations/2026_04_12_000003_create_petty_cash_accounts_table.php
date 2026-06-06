<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePettyCashAccountsTable extends Migration
{
    public function up()
    {
        Schema::create('petty_cash_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->string('name');
            $table->unsignedBigInteger('custodian_id')->nullable(); // FK to users
            $table->unsignedInteger('current_balance')->default(0); // KES integer
            $table->unsignedInteger('imprest_limit')->default(0);   // KES integer
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('custodian_id')->references('id')->on('users')->onDelete('set null');

            $table->index(['school_id', 'is_active'], 'pca_school_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('petty_cash_accounts');
    }
}
