<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('appointment_id')->nullable();

            // ── Date ─────────────────────────────────────────────────────────
            $table->date('date_consultation');

            // ── Vitals (from legacy SQL schema) ──────────────────────────────
            $table->decimal('poids', 5, 2)->nullable()->comment('Weight kg');
            $table->integer('taille')->nullable()->comment('Height cm');
            $table->decimal('temperature', 5, 2)->nullable();
            $table->string('tension_arterielle', 10)->nullable()->comment('e.g. 12/8');

            // ── Diabetology labs (all from legacy SQL schema) ────────────────
            $table->decimal('hba1c', 5, 2)->nullable()->comment('HbA1c %');
            $table->decimal('glycemie_a_jeun', 5, 2)->nullable();
            $table->decimal('glycemie_apres_repas', 5, 2)->nullable();
            $table->decimal('glucagon', 5, 2)->nullable();
            $table->decimal('tt', 5, 2)->nullable();
            $table->decimal('th', 5, 2)->nullable();
            $table->string('glogylie', 500)->nullable();
            $table->char('glucosurie', 1)->nullable()->comment('+/-');
            $table->decimal('cholesterol_total', 5, 2)->nullable()->comment('CT');
            $table->decimal('triglycerides', 5, 2)->nullable()->comment('TG');
            $table->decimal('hdl', 5, 2)->nullable()->comment('HDL cholesterol');
            $table->char('acetone', 1)->nullable()->comment('+/-');

            // ── Clinical notes ───────────────────────────────────────────────
            $table->text('examen_physique')->nullable()->comment('Physical examination notes');
            $table->text('diagnostic')->nullable();
            $table->text('traitement_conseils')->nullable()->comment('Treatment recommendations');

            // ── Payment ──────────────────────────────────────────────────────
            $table->decimal('prix', 8, 2)->nullable();
            $table->boolean('regle')->default(false)->comment('Paid? (was Oui/Non in legacy)');

            // ── Future specialty-agnostic fields ─────────────────────────────
            // Additional specialty fields stored in consultation_custom_fields

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('set null');
            $table->index('tenant_id');
            $table->index(['tenant_id', 'patient_id']);
            $table->index(['tenant_id', 'date_consultation']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
