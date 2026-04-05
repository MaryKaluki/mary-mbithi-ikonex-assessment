<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDetailedFieldsToStudentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            // General
            $table->string('blood_group')->nullable()->after('date_of_birth');
            $table->string('religion')->nullable()->after('blood_group');
            $table->string('nationality')->default('Kenyan')->after('religion');
            
            // Health & Special
            $table->text('medical_conditions')->nullable()->after('nationality');
            $table->text('allergies')->nullable()->after('medical_conditions');
            $table->boolean('has_special_needs')->default(false)->after('allergies');
            $table->text('special_needs_details')->nullable()->after('has_special_needs');
            
            // Background
            $table->text('residential_address')->nullable()->after('special_needs_details');
            $table->string('previous_school')->nullable()->after('residential_address');
            
            // Logistics
            $table->string('house_group')->nullable()->after('grade_level'); // e.g. Simba, Chui
            $table->enum('mode_of_transport', ['Walking', 'Private', 'School Bus', 'Public'])->default('Walking')->after('house_group');
            
            // Secondary Parent
            $table->string('secondary_parent_name')->nullable()->after('parent_email');
            $table->string('secondary_parent_phone')->nullable()->after('secondary_parent_name');
            $table->string('secondary_parent_relationship')->nullable()->after('secondary_parent_phone');
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'blood_group', 'religion', 'nationality', 'medical_conditions', 
                'allergies', 'has_special_needs', 'special_needs_details', 
                'residential_address', 'previous_school', 'house_group', 
                'mode_of_transport', 'secondary_parent_name', 'secondary_parent_phone', 
                'secondary_parent_relationship'
            ]);
        });
    }
}
