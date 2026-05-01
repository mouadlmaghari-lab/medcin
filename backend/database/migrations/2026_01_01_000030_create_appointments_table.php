<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('patient_id')->nullable()->comment('NULL for walk-in before patient is created');
            $table->unsignedBigInteger('created_by')->nullable()->comment('user_id of doctor or secretary who booked');

            // Legacy Rdvs fields
            $table->string('patient_name', 50)->nullable()->comment('Quick reference name (from legacy schema)');
            $table->string('telephone', 50)->nullable();
            $table->dateTime('debut');
            $table->dateTime('fin');
            $table->string('etat', 20)->default('en_attente')
                ->comment('en_attente|confirme|en_cours|termine|annule|absent');
            $table->string('description', 250)->nullable();

            // SaaS additions
            $table->enum('booking_source', ['web', 'mobile', 'walkin'])->default('web');
            $table->boolean('reminder_sent_24h')->default(false);
            $table->boolean('reminder_sent_1h')->default(false);

            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('set null');
            $table->index('tenant_id');
            $table->index(['tenant_id', 'debut']);
            $table->unique(['tenant_id', 'debut'], 'unique_slot_per_doctor');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
