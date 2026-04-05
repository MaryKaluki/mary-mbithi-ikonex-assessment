<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterStudentsAddTransportRouteId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'transport_route_id')) {
                $table->unsignedBigInteger('transport_route_id')->nullable()->after('mode_of_transport');
                $table->foreign('transport_route_id')->references('id')->on('transport_routes')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'transport_route_id')) {
                $table->dropForeign(['transport_route_id']);
                $table->dropColumn('transport_route_id');
            }
        });
    }
}
