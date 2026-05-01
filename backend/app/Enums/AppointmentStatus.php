<?php

namespace App\Enums;

enum AppointmentStatus: string
{
    case Pending    = 'en_attente';
    case Confirmed  = 'confirme';
    case InProgress = 'en_cours';
    case Done       = 'termine';
    case Cancelled  = 'annule';
    case Absent     = 'absent';

    public function label(string $locale = 'fr'): string
    {
        return match($this) {
            self::Pending    => 'En attente',
            self::Confirmed  => 'Confirmé',
            self::InProgress => 'En cours',
            self::Done       => 'Terminé',
            self::Cancelled  => 'Annulé',
            self::Absent     => 'Absent',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::Pending    => 'yellow',
            self::Confirmed  => 'blue',
            self::InProgress => 'indigo',
            self::Done       => 'green',
            self::Cancelled  => 'red',
            self::Absent     => 'gray',
        };
    }
}
