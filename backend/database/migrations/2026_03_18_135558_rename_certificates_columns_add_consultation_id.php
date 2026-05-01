<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            // Rename legacy columns to match frontend field names 1:1
            $table->renameColumn('atteste_que', 'contenu');
            $table->renameColumn('debut', 'date_debut');
            $table->renameColumn('fin', 'date_fin');
            $table->renameColumn('duree_jours', 'nombre_jours');

            // Add consultation_id (nullable — certificates can exist without a consultation)
            $table->unsignedBigInteger('consultation_id')->nullable()->after('patient_id');
            $table->foreign('consultation_id')->references('id')->on('consultations')->onDelete('set null');
            $table->index('consultation_id');
        });
    }

    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropForeign(['consultation_id']);
            $table->dropIndex(['consultation_id']);
            $table->dropColumn('consultation_id');

            $table->renameColumn('contenu', 'atteste_que');
            $table->renameColumn('date_debut', 'debut');
            $table->renameColumn('date_fin', 'fin');
            $table->renameColumn('nombre_jours', 'duree_jours');
        });
    }
};
