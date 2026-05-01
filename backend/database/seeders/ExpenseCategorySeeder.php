<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExpenseCategorySeeder extends Seeder
{
    /**
     * Seed default expense categories for medical cabinets.
     * These are tenant-scoped — created per-tenant on first login.
     * This seeder creates a template set (tenant_id = null) for copying.
     */
    public function run(): void
    {
        $categories = [
            ['nom' => 'Loyer',                 'couleur' => '#EF4444'],
            ['nom' => 'Utilitaires',           'couleur' => '#F59E0B'],
            ['nom' => 'Fournitures médicales',  'couleur' => '#10B981'],
            ['nom' => 'Fournitures bureau',     'couleur' => '#6366F1'],
            ['nom' => 'Équipement médical',     'couleur' => '#8B5CF6'],
            ['nom' => 'Salaires',              'couleur' => '#3B82F6'],
            ['nom' => 'Assurance',             'couleur' => '#EC4899'],
            ['nom' => 'Entretien & nettoyage', 'couleur' => '#14B8A6'],
            ['nom' => 'Informatique & logiciel', 'couleur' => '#64748B'],
            ['nom' => 'Laboratoire',           'couleur' => '#F97316'],
            ['nom' => 'Transport',             'couleur' => '#84CC16'],
            ['nom' => 'Formation continue',    'couleur' => '#06B6D4'],
            ['nom' => 'Publicité & marketing', 'couleur' => '#A855F7'],
            ['nom' => 'Taxes & impôts',        'couleur' => '#DC2626'],
            ['nom' => 'Autre',                 'couleur' => '#9CA3AF'],
        ];

        foreach ($categories as $category) {
            DB::table('expense_categories')->updateOrInsert(
                ['nom' => $category['nom'], 'tenant_id' => null],
                array_merge($category, [
                    'tenant_id'  => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
