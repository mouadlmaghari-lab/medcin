<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Seed the three application roles.
     * Must run after Spatie Permission tables are created.
     */
    public function run(): void
    {
        $roles = [
            UserRole::DOCTOR->value,
            UserRole::SECRETARY->value,
            UserRole::PATIENT->value,
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
            // Also create for API guard (JWT patients)
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'api']);
        }

        $this->command->info('Roles seeded: doctor, secretary, patient (web + api guards).');
    }
}
