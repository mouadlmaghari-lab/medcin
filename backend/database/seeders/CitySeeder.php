<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    /**
     * Seed Moroccan cities (64+ cities grouped by region).
     */
    public function run(): void
    {
        $cities = [
            // Casablanca-Settat
            ['nom' => 'Casablanca',      'region' => 'Casablanca-Settat'],
            ['nom' => 'Mohammedia',      'region' => 'Casablanca-Settat'],
            ['nom' => 'El Jadida',       'region' => 'Casablanca-Settat'],
            ['nom' => 'Settat',          'region' => 'Casablanca-Settat'],
            ['nom' => 'Berrechid',       'region' => 'Casablanca-Settat'],
            ['nom' => 'Khouribga',       'region' => 'Casablanca-Settat'],
            ['nom' => 'Benslimane',      'region' => 'Casablanca-Settat'],

            // Rabat-Salé-Kénitra
            ['nom' => 'Rabat',           'region' => 'Rabat-Salé-Kénitra'],
            ['nom' => 'Salé',            'region' => 'Rabat-Salé-Kénitra'],
            ['nom' => 'Kénitra',         'region' => 'Rabat-Salé-Kénitra'],
            ['nom' => 'Témara',          'region' => 'Rabat-Salé-Kénitra'],
            ['nom' => 'Skhirate',        'region' => 'Rabat-Salé-Kénitra'],
            ['nom' => 'Sidi Kacem',      'region' => 'Rabat-Salé-Kénitra'],
            ['nom' => 'Sidi Slimane',    'region' => 'Rabat-Salé-Kénitra'],

            // Marrakech-Safi
            ['nom' => 'Marrakech',       'region' => 'Marrakech-Safi'],
            ['nom' => 'Safi',            'region' => 'Marrakech-Safi'],
            ['nom' => 'Essaouira',       'region' => 'Marrakech-Safi'],
            ['nom' => 'El Kelâa des Sraghna', 'region' => 'Marrakech-Safi'],
            ['nom' => 'Youssoufia',      'region' => 'Marrakech-Safi'],

            // Fès-Meknès
            ['nom' => 'Fès',             'region' => 'Fès-Meknès'],
            ['nom' => 'Meknès',          'region' => 'Fès-Meknès'],
            ['nom' => 'Taza',            'region' => 'Fès-Meknès'],
            ['nom' => 'Ifrane',          'region' => 'Fès-Meknès'],
            ['nom' => 'Sefrou',          'region' => 'Fès-Meknès'],
            ['nom' => 'Moulay Yacoub',   'region' => 'Fès-Meknès'],

            // Tanger-Tétouan-Al Hoceïma
            ['nom' => 'Tanger',          'region' => 'Tanger-Tétouan-Al Hoceïma'],
            ['nom' => 'Tétouan',         'region' => 'Tanger-Tétouan-Al Hoceïma'],
            ['nom' => 'Al Hoceïma',      'region' => 'Tanger-Tétouan-Al Hoceïma'],
            ['nom' => 'Larache',         'region' => 'Tanger-Tétouan-Al Hoceïma'],
            ['nom' => 'Chefchaouen',     'region' => 'Tanger-Tétouan-Al Hoceïma'],
            ['nom' => 'Fnideq',          'region' => 'Tanger-Tétouan-Al Hoceïma'],
            ['nom' => 'Ouezzane',        'region' => 'Tanger-Tétouan-Al Hoceïma'],

            // Souss-Massa
            ['nom' => 'Agadir',          'region' => 'Souss-Massa'],
            ['nom' => 'Inezgane',        'region' => 'Souss-Massa'],
            ['nom' => 'Ait Melloul',     'region' => 'Souss-Massa'],
            ['nom' => 'Taroudant',       'region' => 'Souss-Massa'],
            ['nom' => 'Tiznit',          'region' => 'Souss-Massa'],

            // Oriental
            ['nom' => 'Oujda',           'region' => 'Oriental'],
            ['nom' => 'Nador',           'region' => 'Oriental'],
            ['nom' => 'Berkane',         'region' => 'Oriental'],
            ['nom' => 'Taourirt',        'region' => 'Oriental'],
            ['nom' => 'Jerada',          'region' => 'Oriental'],
            ['nom' => 'Figuig',          'region' => 'Oriental'],

            // Béni Mellal-Khénifra
            ['nom' => 'Béni Mellal',     'region' => 'Béni Mellal-Khénifra'],
            ['nom' => 'Khénifra',        'region' => 'Béni Mellal-Khénifra'],
            ['nom' => 'Fquih Ben Salah', 'region' => 'Béni Mellal-Khénifra'],
            ['nom' => 'Azilal',          'region' => 'Béni Mellal-Khénifra'],

            // Drâa-Tafilalet
            ['nom' => 'Errachidia',      'region' => 'Drâa-Tafilalet'],
            ['nom' => 'Ouarzazate',      'region' => 'Drâa-Tafilalet'],
            ['nom' => 'Tinghir',         'region' => 'Drâa-Tafilalet'],
            ['nom' => 'Zagora',          'region' => 'Drâa-Tafilalet'],
            ['nom' => 'Midelt',          'region' => 'Drâa-Tafilalet'],

            // Guelmim-Oued Noun
            ['nom' => 'Guelmim',         'region' => 'Guelmim-Oued Noun'],
            ['nom' => 'Tan-Tan',         'region' => 'Guelmim-Oued Noun'],
            ['nom' => 'Sidi Ifni',       'region' => 'Guelmim-Oued Noun'],

            // Laâyoune-Sakia El Hamra
            ['nom' => 'Laâyoune',        'region' => 'Laâyoune-Sakia El Hamra'],
            ['nom' => 'Boujdour',        'region' => 'Laâyoune-Sakia El Hamra'],
            ['nom' => 'Tarfaya',         'region' => 'Laâyoune-Sakia El Hamra'],

            // Dakhla-Oued Ed-Dahab
            ['nom' => 'Dakhla',          'region' => 'Dakhla-Oued Ed-Dahab'],
            ['nom' => 'Aousserd',        'region' => 'Dakhla-Oued Ed-Dahab'],

            // Additional notable cities
            ['nom' => 'Khemisset',       'region' => 'Rabat-Salé-Kénitra'],
            ['nom' => 'Bouznika',        'region' => 'Casablanca-Settat'],
            ['nom' => 'Azrou',           'region' => 'Fès-Meknès'],
            ['nom' => 'Guercif',         'region' => 'Oriental'],
            ['nom' => 'Assa',            'region' => 'Guelmim-Oued Noun'],
        ];

        foreach ($cities as $city) {
            City::firstOrCreate(
                ['nom' => $city['nom']],
                $city
            );
        }
    }
}
