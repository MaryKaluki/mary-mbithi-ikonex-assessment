<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterLeaveRequestsAddLeaveType extends Migration
{
    public function up()
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            // Link to the new dynamic leave_types table (nullable so existing rows survive)
            $table->foreignId('leave_type_id')->nullable()->after('user_id')
                ->constrained('leave_types')->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropForeign(['leave_type_id']);
            $table->dropColumn('leave_type_id');
        });
    }
}
