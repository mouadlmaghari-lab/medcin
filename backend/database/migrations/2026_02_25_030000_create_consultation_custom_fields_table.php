<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultation_custom_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('consultation_id')->constrained()->onDelete('cascade');
            $table->string('field_name', 100)->comment('Custom field key');
            $table->string('field_label', 200)->comment('Display label (FR)');
            $table->string('field_type', 30)->default('text')->comment('text|number|boolean|date|select');
            $table->text('field_value')->nullable();
            $table->string('unit', 30)->nullable()->comment('mg/dL, mmHg, etc.');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['tenant_id', 'consultation_id']);
            $table->index(['consultation_id', 'field_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultation_custom_fields');
    }
};
