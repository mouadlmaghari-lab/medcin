<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Links a patient app account (user with role=patient) to a doctor's patient record
        Schema::create('doctor_patient_links', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->comment('Doctor user_id');
            $table->unsignedBigInteger('patient_record_id')->comment('FK to patients table');
            $table->unsignedBigInteger('patient_account_id')->comment('FK to users table (patient app account)');
            $table->string('statut', 20)->default('pending')->comment('pending|approved|rejected');
            $table->timestamp('consent_at')->nullable()->comment('Law 09-08: record patient consent timestamp');
            $table->string('scenario', 10)->default('A')->comment('A|B|C (linking scenario)');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('patient_record_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('patient_account_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['tenant_id', 'patient_account_id']);
            $table->index('patient_account_id');
        });

        // Per-doctor permission settings controlled by the patient
        Schema::create('patient_permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('link_id')->comment('FK to doctor_patient_links');
            $table->boolean('partager_consultations')->default(false);
            $table->boolean('partager_analyses')->default(false);
            $table->boolean('voir_historique')->default(false);
            $table->timestamps();

            $table->foreign('link_id')->references('id')->on('doctor_patient_links')->onDelete('cascade');
            $table->unique('link_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_permissions');
        Schema::dropIfExists('doctor_patient_links');
    }
};
