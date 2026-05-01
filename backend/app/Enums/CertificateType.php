<?php

namespace App\Enums;

enum CertificateType: string
{
    case Rest             = 'repos';
    case Aptitude         = 'aptitude';
    case Inapatitude      = 'inapatitude';
    case Hospitalisation  = 'hospitalisation';
    case Custom           = 'custom';

    public function label(): string
    {
        return match($this) {
            self::Rest            => 'Certificat de repos',
            self::Aptitude        => "Certificat d'aptitude",
            self::Inapatitude     => "Certificat d'inaptitude",
            self::Hospitalisation => "Certificat d'hospitalisation",
            self::Custom          => 'Certificat personnalisé',
        };
    }
}
