<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 5A — Add fee_per_term to transport_routes and dormitory_allocations
 * so auto-billing can pull the term fee when issuing invoices.
 */
class AddFeePerTermToTransportRoutesAndDormAllocations extends Migration
{
    public function up()
    {
        // transport_routes — add fee_per_term
        Schema::table('transport_routes', function (Blueprint $table) {
            $table->unsignedBigInteger('fee_per_term')->default(0)->after('status')
                  ->comment('Term transport fee in integer KES');
            $table->string('pickup_point')->nullable()->after('fee_per_term')
                  ->comment('Default pickup/drop-off point description for route');
        });

        // dorm_allocations — add fee_per_term + moved_out_on (needed by FeeService::studentMode)
        Schema::table('dorm_allocations', function (Blueprint $table) {
            $table->unsignedBigInteger('fee_per_term')->default(0)->after('assigned_date')
                  ->comment('Term dorm fee in integer KES (overrides dormitory default)');
            $table->date('moved_out_on')->nullable()->after('fee_per_term')
                  ->comment('Date student left the dorm; null = currently allocated');
            $table->unsignedBigInteger('academic_year')->nullable()->after('moved_out_on')
                  ->comment('Academic year of allocation (for isolation)');
            $table->unsignedTinyInteger('term')->nullable()->after('academic_year')
                  ->comment('Term of allocation');
        });

        // dormitories — add default fee_per_term so we can inherit if dorm_allocation is 0
        Schema::table('dormitories', function (Blueprint $table) {
            $table->unsignedBigInteger('fee_per_term')->default(0)->after('status')
                  ->comment('Default dorm fee per term in integer KES');
        });
    }

    public function down()
    {
        Schema::table('transport_routes', function (Blueprint $table) {
            $table->dropColumn(['fee_per_term', 'pickup_point']);
        });
        Schema::table('dorm_allocations', function (Blueprint $table) {
            $table->dropColumn(['fee_per_term', 'moved_out_on', 'academic_year', 'term']);
        });
        Schema::table('dormitories', function (Blueprint $table) {
            $table->dropColumn('fee_per_term');
        });
    }
}
