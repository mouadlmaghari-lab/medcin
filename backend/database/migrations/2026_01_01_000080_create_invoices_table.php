<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('consultation_id')->nullable();

            $table->string('numero', 30)->comment('e.g. FACT-2026-0001 per doctor per year');
            $table->date('date_facture');
            $table->string('statut', 20)->default('draft')
                ->comment('draft|sent|paid|overdue');

            // Amounts
            $table->decimal('montant_ht', 10, 2)->default(0)->comment('Before tax');
            $table->decimal('tva', 5, 2)->default(0)->comment('TVA rate %');
            $table->decimal('montant_ttc', 10, 2)->default(0)->comment('Total with tax');

            $table->string('pdf_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('consultation_id')->references('id')->on('consultations')->onDelete('set null');
            $table->index('tenant_id');
            $table->unique(['tenant_id', 'numero']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
