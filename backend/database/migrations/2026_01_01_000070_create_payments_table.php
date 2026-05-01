<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('consultation_id');
            $table->unsignedBigInteger('patient_id');

            // Legacy REGLEMENTS fields
            $table->date('date_paiement')->default(now());
            $table->decimal('somme', 10, 2);
            $table->text('description')->nullable()->comment('Payment description (was "body")');
            $table->string('lettre', 150)->nullable()->comment('Amount in written letters');

            // SaaS additions
            $table->string('methode_paiement', 20)->default('espece')
                ->comment('espece|carte|assurance');
            $table->decimal('reste_a_payer', 10, 2)->default(0);
            $table->string('reference_assurance', 100)->nullable();
            $table->string('numero_recu', 20)->nullable()->comment('Auto-generated receipt number');

            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('consultation_id')->references('id')->on('consultations')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->index('tenant_id');
            $table->index(['tenant_id', 'date_paiement']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
