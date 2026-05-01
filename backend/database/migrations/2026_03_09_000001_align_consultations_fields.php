<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Align consultations table with canonical frontend field names.
 *
 * Changes:
 *  - Rename examen_physique  → examen_clinique
 *  - Rename traitement_conseils → conduite_a_tenir
 *  - Add saturation_o2, frequence_cardiaque, frequence_respiratoire, ldl, glycemie
 *
 * Note: tension_arterielle column is kept as-is (string "sys/dia").
 * The API now accepts tension_systolique + tension_diastolique and the
 * controller combines them before storing in tension_arterielle.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            // ── Rename clinical text columns ──────────────────────────────────
            $table->renameColumn('examen_physique', 'examen_clinique');
            $table->renameColumn('traitement_conseils', 'conduite_a_tenir');

            // ── Add missing vitals ─────────────────────────────────────────────
            $table->decimal('saturation_o2', 5, 2)->nullable()->after('tension_arterielle')
                ->comment('SpO2 %');
            $table->unsignedSmallInteger('frequence_cardiaque')->nullable()->after('saturation_o2')
                ->comment('Heart rate bpm');
            $table->unsignedSmallInteger('frequence_respiratoire')->nullable()->after('frequence_cardiaque')
                ->comment('Respiratory rate per min');

            // ── Add missing labs ───────────────────────────────────────────────
            $table->decimal('glycemie', 5, 2)->nullable()->after('hba1c')
                ->comment('Current blood glucose mmol/L');
            $table->decimal('ldl', 5, 2)->nullable()->after('hdl')
                ->comment('LDL cholesterol');
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->renameColumn('examen_clinique', 'examen_physique');
            $table->renameColumn('conduite_a_tenir', 'traitement_conseils');

            $table->dropColumn([
                'saturation_o2',
                'frequence_cardiaque',
                'frequence_respiratoire',
                'glycemie',
                'ldl',
            ]);
        });
    }
};
