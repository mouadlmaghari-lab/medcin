<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Patient JWT refresh token store.
 * Access tokens are short-lived (8h). Refresh tokens last 30 days.
 * Stored as hashed values (SHA-256) — never plaintext.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_refresh_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('token', 64)->unique()->comment('SHA-256 hash of the refresh token');
            $table->timestamp('expires_at');
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_refresh_tokens');
    }
};
