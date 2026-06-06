<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFinancialReportsTable extends Migration
{
    public function up()
    {
        Schema::create('financial_reports', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->string('report_type', 60); // daily-collection, receipts-register, etc.
            $table->json('parameters')->nullable(); // date range, term, class_id, etc.
            $table->unsignedBigInteger('generated_by')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->string('file_path')->nullable(); // cached PDF storage path
            $table->timestamps();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('generated_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['school_id', 'report_type', 'generated_at'], 'fr_school_type_date');
        });
    }

    public function down()
    {
        Schema::dropIfExists('financial_reports');
    }
}
