<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Always seed roles first — other seeders depend on them
        $this->call([
            RoleSeeder::class,
            CitySeeder::class,
            ExpenseCategorySeeder::class,
            TestUserSeeder::class,
        ]);
    }
}
