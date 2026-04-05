<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSubscriptionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('school_id'); // Relation to schools table
            $table->string('plan_name'); // Basic, Standard, Enterprise
            $table->decimal('amount', 10, 2);
            $table->string('period')->default('monthly'); // monthly, yearly
            $table->date('next_billing_date')->nullable();
            $table->enum('status', ['Active', 'Cancelled', 'Past Due'])->default('Active');
            $table->timestamps();

            // Foreign Key Constraint
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('subscriptions');
    }
}
