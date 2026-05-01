<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Extend the default users table with doctor/practice fields
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('doctor')->after('email'); // doctor | secretary | patient
            $table->unsignedBigInteger('tenant_id')->nullable()->after('role'); // for secretaries: their doctor's id
            $table->string('nom_complet', 150)->nullable()->after('name');
            $table->string('nom_arabe', 150)->nullable();
            $table->string('adresse', 250)->nullable();
            $table->string('adresse_arabe', 250)->nullable();
            $table->string('telephone', 20)->nullable();
            $table->string('specialite', 100)->nullable();
            $table->string('inpe', 50)->nullable()->comment('Numéro INPE du médecin');
            $table->string('logo_path')->nullable();
            $table->string('tampon_path')->nullable()->comment('Stamp/signature image path');
            $table->string('ordonnance_header')->nullable();
            $table->string('ordonnance_footer')->nullable();
            $table->integer('consultation_duration')->default(30)->comment('Default slot duration in minutes');
            $table->decimal('prix_consultation_defaut', 8, 2)->nullable();
            $table->json('working_hours')->nullable()->comment('JSON: {mon: [start, end], ...}');
            $table->string('language', 5)->default('fr');
            $table->boolean('notifications_enabled')->default(true);
            $table->string('onesignal_player_id')->nullable();
            $table->boolean('two_factor_enabled')->default(false);
            $table->string('two_factor_secret')->nullable();
            $table->boolean('active')->default(true);

            $table->index('tenant_id');
            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role', 'tenant_id', 'nom_complet', 'nom_arabe', 'adresse', 'adresse_arabe',
                'telephone', 'specialite', 'inpe', 'logo_path', 'tampon_path',
                'ordonnance_header', 'ordonnance_footer', 'consultation_duration',
                'prix_consultation_defaut', 'working_hours', 'language',
                'notifications_enabled', 'onesignal_player_id',
                'two_factor_enabled', 'two_factor_secret', 'active',
            ]);
        });
    }
};
