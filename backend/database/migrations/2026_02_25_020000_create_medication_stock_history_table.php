<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medication_stock_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('medication_id')->constrained()->onDelete('cascade');
            $table->string('type', 30)->comment('entree|sortie|ajustement|expiration');
            $table->integer('quantite')->comment('Positive for in, negative for out');
            $table->integer('stock_avant')->comment('Stock level before change');
            $table->integer('stock_apres')->comment('Stock level after change');
            $table->string('reference', 100)->nullable()->comment('Invoice/prescription/order reference');
            $table->text('motif')->nullable()->comment('Reason for adjustment');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['tenant_id', 'medication_id']);
            $table->index(['medication_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medication_stock_history');
    }
};
