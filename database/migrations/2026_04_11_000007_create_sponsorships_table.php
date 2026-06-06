<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSponsorshipsTable extends Migration
{
    public function up()
    {
        Schema::create('sponsorships', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');                     // varchar — matches schools.id
            $table->unsignedBigInteger('student_id');
            $table->string('sponsor_name');
            $table->string('sponsor_contact')->nullable();
            $table->unsignedBigInteger('amount_per_term');   // integer KES
            $table->string('covers')->nullable();
            $table->string('start_term', 5)->nullable();
            $table->string('start_year', 10)->nullable();
            $table->string('end_term', 5)->nullable();
            $table->string('end_year', 10)->nullable();
            $table->boolean('active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');

            $table->index(['school_id', 'student_id', 'active']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('sponsorships');
    }
}
