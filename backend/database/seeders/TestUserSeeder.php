<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Doctor ────────────────────────────────────────────────────────
        $doctor = User::updateOrCreate(
            ['email' => 'docteur@tabibcare.ma'],
            [
                'name'                     => 'Dr. Ahmed Benali',
                'nom_complet'              => 'Dr. Ahmed Benali',
                'password'                 => Hash::make('Doctor123!'),
                'role'                     => UserRole::DOCTOR->value,
                'specialite'               => 'Médecine Générale',
                'inpe'                     => 'INPE-2026-001',
                'telephone'                => '0661234567',
                'adresse'                  => '12 Rue Ibn Sina, Casablanca',
                'consultation_duration'    => 20,
                'prix_consultation_defaut' => 200.00,
                'language'                 => 'fr',
                'active'                   => true,
            ]
        );

        // Doctor's tenant_id is their own id
        $doctor->tenant_id = $doctor->id;
        $doctor->save();

        // Assign Spatie role
        $doctor->syncRoles([UserRole::DOCTOR->value]);

        $this->command->info("Doctor created: docteur@tabibcare.ma / Doctor123!");

        // ── Secretary (Aide-Médecin / Assistant) ─────────────────────────
        $secretary = User::updateOrCreate(
            ['email' => 'secretaire@tabibcare.ma'],
            [
                'name'        => 'Fatima Zahra Alaoui',
                'nom_complet' => 'Fatima Zahra Alaoui',
                'password'    => Hash::make('Secret123!'),
                'role'        => UserRole::SECRETARY->value,
                'tenant_id'   => $doctor->id, // belongs to the doctor above
                'telephone'   => '0662345678',
                'language'    => 'fr',
                'active'      => true,
            ]
        );

        // Assign Spatie role
        $secretary->syncRoles([UserRole::SECRETARY->value]);

        $this->command->info("Secretary created: secretaire@tabibcare.ma / Secret123!");
        $this->command->info("Both accounts are linked to tenant_id: {$doctor->id}");

        // ── Test Doctor (admin@doctor.com) ───────────────────────────────────
        $adminDoctor = User::updateOrCreate(
            ['email' => 'admin@doctor.com'],
            [
                'name'                     => 'Admin Doctor',
                'nom_complet'              => 'Admin Doctor',
                'password'                 => Hash::make('password'),
                'role'                     => UserRole::DOCTOR->value,
                'specialite'               => 'Généraliste',
                'inpe'                     => 'INPE-2026-999',
                'telephone'                => '0600000000',
                'adresse'                  => 'Test Address',
                'consultation_duration'    => 20,
                'prix_consultation_defaut' => 250.00,
                'language'                 => 'fr',
                'active'                   => true,
            ]
        );

        // Doctor's tenant_id is their own id
        $adminDoctor->tenant_id = $adminDoctor->id;
        $adminDoctor->save();

        // Assign Spatie role
        $adminDoctor->syncRoles([UserRole::DOCTOR->value]);

        $this->command->info("Test doctor created: admin@doctor.com / password");
    }
}
