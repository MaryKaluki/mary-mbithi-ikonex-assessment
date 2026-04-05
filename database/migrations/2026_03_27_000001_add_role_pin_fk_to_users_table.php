<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRolePinFkToUsersTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // 1. Drop the plain index added by the previous migration,
            //    then re-add school_id as a proper foreign key.
            $table->dropIndex('users_school_id_index');
            $table->foreign('school_id')
                  ->references('id')
                  ->on('schools')
                  ->cascadeOnDelete(); // school-bound users are deleted when school is deleted
                                      // platform admins have NULL school_id — FK only fires on non-null values

            // 2. Role ENUM — every user must have a role
            $table->enum('role', [
                'platform_admin',
                'super_admin',
                'school_admin',
                'admin',
                'teacher',
                'student',
                'parent',
                'accountant',
                'hr_manager',
                'driver',
                'librarian',
            ])->default('school_admin')->after('school_id');

            // 3. Optional PIN for quick kiosk-style access
            $table->string('pin', 6)->nullable()->after('role');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['school_id']);
            $table->index('school_id'); // restore plain index
            $table->dropColumn(['role', 'pin']);
        });
    }
}
