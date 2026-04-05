<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddVisibilityToDocumentsTable extends Migration
{
    public function up()
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->enum('visibility_type', ['all_teachers', 'specific_teacher'])->default('all_teachers')->after('category');
            $table->unsignedBigInteger('visible_to_user_id')->nullable()->after('visibility_type');
            $table->foreign('visible_to_user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['visible_to_user_id']);
            $table->dropColumn(['visibility_type', 'visible_to_user_id']);
        });
    }
}
