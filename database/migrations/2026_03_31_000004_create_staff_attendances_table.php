<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStaffAttendancesTable extends Migration
{
    public function up()
    {
        Schema::create('staff_attendances', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');   // staff member
            $table->foreignId('marked_by')->constrained('users')->onDelete('cascade'); // HR who marked
            $table->date('date');
            $table->enum('status', ['Present', 'Late', 'Absent', 'Excused'])->default('Present');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['school_id', 'user_id', 'date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('staff_attendances');
    }
}
