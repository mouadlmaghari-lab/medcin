<?php

namespace App\Enums;

enum UserRole: string
{
    case DOCTOR    = 'doctor';
    case SECRETARY = 'secretary';
    case PATIENT   = 'patient';

    public function label(): string
    {
        return match($this) {
            self::DOCTOR    => 'Médecin',
            self::SECRETARY => 'Aide-Médecin (Secrétaire)',
            self::PATIENT   => 'Patient',
        };
    }

    /** Roles that belong to a medical practice (have a tenant context) */
    public static function practiceRoles(): array
    {
        return [self::DOCTOR->value, self::SECRETARY->value];
    }
}
