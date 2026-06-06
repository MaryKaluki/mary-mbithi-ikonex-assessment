<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExpensesTable extends Migration
{
    public function up()
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->string('expense_number', 32)->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('description');
            $table->string('vendor')->nullable();
            $table->unsignedInteger('amount'); // KES integer
            $table->enum('payment_method', ['cash', 'mpesa', 'bank_transfer', 'cheque'])->default('cash');
            $table->string('mpesa_code', 20)->nullable();
            $table->string('bank_ref', 64)->nullable();
            $table->string('cheque_number', 32)->nullable();
            $table->string('academic_year', 10)->nullable();
            $table->tinyInteger('term')->nullable();
            $table->date('expense_date');
            $table->string('attachment_path')->nullable();
            $table->enum('status', ['draft', 'pending_approval', 'approved', 'rejected', 'paid'])->default('draft');
            $table->unsignedBigInteger('submitted_by')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedBigInteger('paid_by')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('expense_categories')->onDelete('set null');
            $table->foreign('submitted_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('paid_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['school_id', 'status'], 'exp_school_status');
            $table->index(['school_id', 'academic_year', 'term'], 'exp_school_year_term');
            $table->index(['school_id', 'expense_date'], 'exp_school_date');
            $table->unique(['school_id', 'expense_number'], 'exp_school_number');
        });
    }

    public function down()
    {
        Schema::dropIfExists('expenses');
    }
}
