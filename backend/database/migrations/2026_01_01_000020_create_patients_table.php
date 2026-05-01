<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->comment('Doctor who owns this record');
            $table->unsignedBigInteger('patient_account_id')->nullable()->comment('FK to users table if patient has app');

            // Legacy SQL schema fields (mapped 1:1)
            $table->string('cin', 20)->nullable()->comment('Numéro CIN (carte nationale)');
            $table->string('nom_complet', 100);
            $table->date('date_naissance')->nullable()->comment('Date de naissance');
            $table->string('lieu_naissance', 50)->nullable();
            $table->string('ville', 50)->nullable();
            $table->string('profession', 50)->nullable();
            $table->date('date_inscription')->default(now());
            $table->string('genre', 20)->nullable()->comment('Homme / Femme / Autre');
            $table->string('telephone', 50);
            $table->string('adresse', 250)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('type_couverture', 20)->nullable()->comment('Type de couverture maladie');
            $table->text('observation')->nullable();
            $table->string('type_dossier', 50)->nullable();
            $table->string('id_dossier', 20)->nullable();

            // SaaS additions
            $table->string('numero_dossier', 20)->nullable()->comment('DR-XXXX auto-generated per doctor');
            $table->string('photo_path')->nullable();
            $table->enum('type', ['digital', 'physical'])->default('physical')
                ->comment('digital = has patient app account, physical = manual entry only');
            $table->boolean('active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tenant_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('tenant_id');
            $table->index(['tenant_id', 'telephone']);
            $table->index(['tenant_id', 'cin']);
            $table->index('patient_account_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
