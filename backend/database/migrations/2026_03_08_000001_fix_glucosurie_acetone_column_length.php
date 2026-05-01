<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->string('glucosurie', 5)->nullable()->change()->comment('+/-/++/+++/++++');
            $table->string('acetone', 5)->nullable()->change()->comment('+/-/++/+++/++++');
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->char('glucosurie', 1)->nullable()->change()->comment('+/-');
            $table->char('acetone', 1)->nullable()->change()->comment('+/-');
        });
    }
};
