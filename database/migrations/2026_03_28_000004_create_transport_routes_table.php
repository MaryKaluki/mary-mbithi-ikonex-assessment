<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransportRoutesTable extends Migration
{
    public function up()
    {
        Schema::create('transport_routes', function (Blueprint $table) {
            $table->id();
            $table->string('school_id');
            $table->foreign('school_id')->references('id')->on('schools')->cascadeOnDelete();
            $table->string('name');
            $table->unsignedBigInteger('vehicle_id')->nullable();
            $table->foreign('vehicle_id')->references('id')->on('vehicles')->nullOnDelete();
            $table->unsignedBigInteger('driver_id')->nullable();
            $table->foreign('driver_id')->references('id')->on('users')->nullOnDelete();
            $table->enum('status', ['Active', 'In Transit', 'Arrived', 'Delayed', 'Inactive'])->default('Active');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('transport_routes');
    }
}
