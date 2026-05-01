<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // New table (no legacy equivalent)
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('consultation_id')->nullable();
            $table->date('date_ordonnance');
            $table->text('notes')->nullable();
            $table->string('numero', 20)->nullable()->comment('Auto-generated number per doctor');
            $table->string('pdf_path')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('consultation_id')->references('id')->on('consultations')->onDelete('set null');
            $table->index('tenant_id');
            $table->index(['tenant_id', 'patient_id']);
        });

        Schema::create('prescription_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('prescription_id');
            $table->string('medication_name', 200);
            $table->string('dosage', 100)->nullable()->comment('e.g. 500mg');
            $table->string('frequence', 100)->nullable()->comment('e.g. 2x/jour');
            $table->string('duree', 100)->nullable()->comment('e.g. 7 jours');
            $table->text('instructions')->nullable();
            $table->integer('ordre')->default(0)->comment('Display order');
            $table->timestamps();

            $table->foreign('prescription_id')->references('id')->on('prescriptions')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescription_items');
        Schema::dropIfExists('prescriptions');
    }
};
