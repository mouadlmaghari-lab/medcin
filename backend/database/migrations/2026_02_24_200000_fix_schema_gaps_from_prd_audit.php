<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── 1. Missing table: expertise_attachments (PRD 6.10) ────────
        Schema::create('expertise_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('expertise_id');
            $table->string('file_path');
            $table->string('file_name', 200);
            $table->string('media_type', 20)->default('document')->comment('document|image|lab');
            $table->integer('file_size')->nullable()->comment('bytes');
            $table->timestamps();

            $table->foreign('expertise_id')->references('id')->on('expertises')->onDelete('cascade');
            $table->index('expertise_id');
        });

        // ─── 2. Missing table: cities (PRD 17.1, Appendix 22.H) ───────
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 150);
            $table->string('region', 100)->nullable();
            $table->timestamps();

            $table->index('nom');
        });

        // ─── 3. Missing FK: appointments.created_by → users ────────────
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });

        // ─── 4. Missing FK: patients.patient_account_id → users ────────
        Schema::table('patients', function (Blueprint $table) {
            $table->foreign('patient_account_id')->references('id')->on('users')->onDelete('set null');
        });

        // ─── 5. Missing: payments.invoice_id FK (PRD 6.7 partial payments) ─
        Schema::table('payments', function (Blueprint $table) {
            $table->unsignedBigInteger('invoice_id')->nullable()->after('patient_id');
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('set null');
        });

        // ─── 6. Missing: prescription_items.medication_id FK (PRD 6.8) ─
        Schema::table('prescription_items', function (Blueprint $table) {
            $table->unsignedBigInteger('medication_id')->nullable()->after('prescription_id')
                ->comment('FK to medications if from catalog, NULL for free-text');
            $table->foreign('medication_id')->references('id')->on('medications')->onDelete('set null');
        });

        // ─── 7. Missing: prescription template support (PRD 6.8) ───────
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->boolean('is_template')->default(false)->after('pdf_path');
            $table->string('template_name', 200)->nullable()->after('is_template');
        });

        // ─── 8. Missing: expenses.receipt_path (PRD 8.2 file categories) ─
        Schema::table('expenses', function (Blueprint $table) {
            $table->string('receipt_path')->nullable()->after('notes')
                ->comment('Path to receipt/document attachment');
        });

        // ─── 9. Missing index: patient name search (PRD 6.1) ──────────
        Schema::table('patients', function (Blueprint $table) {
            $table->index(['tenant_id', 'nom_complet']);
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex(['tenant_id', 'nom_complet']);
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn('receipt_path');
        });

        Schema::table('prescriptions', function (Blueprint $table) {
            $table->dropColumn(['is_template', 'template_name']);
        });

        Schema::table('prescription_items', function (Blueprint $table) {
            $table->dropForeign(['medication_id']);
            $table->dropColumn('medication_id');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['invoice_id']);
            $table->dropColumn('invoice_id');
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->dropForeign(['patient_account_id']);
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
        });

        Schema::dropIfExists('cities');
        Schema::dropIfExists('expertise_attachments');
    }
};
