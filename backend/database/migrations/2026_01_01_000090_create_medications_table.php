<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // New table — no legacy equivalent
        Schema::create('medications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->string('nom', 200);
            $table->string('nom_generique', 200)->nullable();
            $table->string('categorie', 100)->nullable();
            $table->string('forme', 50)->nullable()->comment('comprimé|sirop|injection|etc.');
            $table->string('unite', 20)->nullable()->comment('mg|ml|etc.');
            $table->decimal('prix_achat', 8, 2)->nullable();
            $table->decimal('prix_vente', 8, 2)->nullable();
            $table->integer('stock_qty')->default(0);
            $table->integer('stock_alerte_min')->default(5)->comment('Trigger low-stock alert below this');
            $table->date('date_expiration')->nullable();
            $table->string('code_barre', 50)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('tenant_id');
            $table->index(['tenant_id', 'nom']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medications');
    }
};
