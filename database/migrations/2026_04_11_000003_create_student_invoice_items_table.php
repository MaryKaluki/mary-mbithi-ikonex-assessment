<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStudentInvoiceItemsTable extends Migration
{
    public function up()
    {
        Schema::create('student_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');                     // varchar — matches schools.id
            $table->unsignedBigInteger('invoice_id');
            $table->unsignedBigInteger('fee_structure_item_id')->nullable(); // null = ad-hoc charge
            $table->string('description');
            $table->unsignedBigInteger('amount');            // gross (integer KES)
            $table->unsignedBigInteger('discount')->default(0);
            $table->unsignedBigInteger('surcharge')->default(0);
            $table->unsignedBigInteger('net_amount');        // amount - discount + surcharge
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('invoice_id')->references('id')->on('student_fee_invoices')->onDelete('cascade');
            $table->foreign('fee_structure_item_id')->references('id')->on('fee_structure_items')->onDelete('set null');

            $table->index(['school_id', 'invoice_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('student_invoice_items');
    }
}
