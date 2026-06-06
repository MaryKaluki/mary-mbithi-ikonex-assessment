<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBankAccountsTable extends Migration
{
    public function up()
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->string('bank_name', 100);
            $table->string('account_name', 150);
            $table->string('account_number', 512); // encrypted at app layer
            $table->string('branch', 100)->nullable();
            $table->enum('account_type', ['current', 'savings', 'mpesa_paybill'])->default('current');
            $table->string('mpesa_shortcode', 20)->nullable(); // paybill or till number
            $table->integer('current_balance')->default(0);   // last known reconciled, KES integer
            $table->date('as_of_date')->nullable();            // date of last reconciliation
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');

            $table->index(['school_id', 'is_active'], 'ba_school_active');
            $table->index(['school_id', 'account_type'], 'ba_school_type');
            $table->index('mpesa_shortcode', 'ba_mpesa_shortcode');
        });
    }

    public function down()
    {
        Schema::dropIfExists('bank_accounts');
    }
}
