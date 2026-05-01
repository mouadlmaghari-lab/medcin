<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('patient_id');

            // Legacy Certificats schema fields
            $table->date('date_certificat');
            $table->string('atteste_que', 250)->nullable()->comment('Attestation text (certifies that...)');
            $table->string('type', 150)->comment('repos|aptitude|autre');
            $table->string('urgence', 150)->nullable();
            $table->integer('duree_jours')->nullable()->comment('Duration in days (was "delay")');
            $table->date('debut')->nullable()->comment('Validity start date');
            $table->date('fin')->nullable()->comment('Validity end date');

            // SaaS additions
            $table->string('numero', 20)->nullable()->comment('Auto-generated cert number per doctor');
            $table->string('pdf_path')->nullable();

            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->index('tenant_id');
            $table->index(['tenant_id', 'patient_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
