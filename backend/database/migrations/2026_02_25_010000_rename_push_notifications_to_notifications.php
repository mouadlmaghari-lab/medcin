<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::rename('push_notifications', 'notifications');

        Schema::table('notifications', function (Blueprint $table) {
            $table->string('channel', 30)->default('push')
                ->after('type')
                ->comment('push|sms|email|in_app');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn('channel');
        });

        Schema::rename('notifications', 'push_notifications');
    }
};
