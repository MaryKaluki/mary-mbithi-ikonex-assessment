<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSchoolsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->string('id')->primary(); // Alphanumeric code e.g. MSI-48X2
            $table->string('name');
            $table->string('domain')->unique(); // e.g., 'hilltop' for hilltop.ikonex.com
            $table->string('admin_email');
            $table->string('logo_path')->nullable();
            $table->enum('school_type', ['Kindergarten', 'Primary (CBC)', 'Junior School', 'Senior School', 'Hybrid'])->default('Primary (CBC)');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->date('deployment_date')->nullable();
            $table->enum('plan', ['Basic', 'Standard', 'Enterprise'])->default('Standard');
            $table->enum('status', ['Active', 'Suspended', 'Trial'])->default('Active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('schools');
    }
}
