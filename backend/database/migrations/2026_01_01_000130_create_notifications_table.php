<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('push_notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('type', 60)->comment('appointment_reminder|booking_confirmed|prescription_ready|etc.');
            $table->string('titre', 200);
            $table->text('body');
            $table->json('data')->nullable()->comment('Extra payload (appointment_id, etc.)');
            $table->boolean('lu')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'lu']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_notifications');
    }
};
