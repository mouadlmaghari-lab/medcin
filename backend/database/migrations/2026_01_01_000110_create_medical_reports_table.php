<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('patient_id');
            $table->string('titre', 200);
            $table->text('contenu');
            $table->date('date_rapport');
            $table->boolean('partage_patient')->default(false)->comment('Visible to patient in app?');
            $table->string('pdf_path')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->index('tenant_id');
            $table->index(['tenant_id', 'patient_id']);
        });

        Schema::create('expertises', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('patient_id');
            $table->string('titre', 200);
            $table->text('contenu')->nullable();
            $table->date('date_expertise');
            $table->string('statut', 20)->default('en_cours')->comment('en_cours|termine');
            $table->string('pdf_path')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->index('tenant_id');
        });

        Schema::create('evolutions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('patient_id');
            $table->date('date_evolution');
            $table->text('note');
            $table->string('type', 50)->nullable()->comment('visit|observation|lab|etc.');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->index(['tenant_id', 'patient_id', 'date_evolution']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evolutions');
        Schema::dropIfExists('expertises');
        Schema::dropIfExists('medical_reports');
    }
};
