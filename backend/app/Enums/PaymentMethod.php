<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Cash      = 'espece';
    case Card      = 'carte';
    case Insurance = 'assurance';

    public function label(): string
    {
        return match($this) {
            self::Cash      => 'Espèce',
            self::Card      => 'Carte bancaire',
            self::Insurance => 'Assurance',
        };
    }
}
