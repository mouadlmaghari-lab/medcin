<?php

use App\Models\User;

describe('GET /api/v1/doctor/consultations/validation-rules', function () {

    it('returns 200 with full constraint map for an authenticated doctor', function () {
        $doctor = User::factory()->doctor()->create();

        $response = actingAs($doctor)
            ->getJson('/api/v1/doctor/consultations/validation-rules');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'patient_id'             => ['type', 'required'],
                    'appointment_id'         => ['type', 'required'],
                    'date_consultation'      => ['type', 'required'],
                    'poids'                  => ['type', 'required', 'min', 'max'],
                    'taille'                 => ['type', 'required', 'min', 'max'],
                    'temperature'            => ['type', 'required', 'min', 'max'],
                    'tension_systolique'     => ['type', 'required', 'min', 'max'],
                    'tension_diastolique'    => ['type', 'required', 'min', 'max'],
                    'saturation_o2'          => ['type', 'required', 'min', 'max'],
                    'frequence_cardiaque'    => ['type', 'required', 'min', 'max'],
                    'frequence_respiratoire' => ['type', 'required', 'min', 'max'],
                    'glycemie'               => ['type', 'required', 'min'],
                    'glycemie_a_jeun'        => ['type', 'required', 'min'],
                    'glycemie_apres_repas'   => ['type', 'required', 'min'],
                    'hba1c'                  => ['type', 'required', 'min', 'max'],
                    'glucagon'               => ['type', 'required', 'min'],
                    'tt'                     => ['type', 'required'],
                    'th'                     => ['type', 'required'],
                    'glogylie'               => ['type', 'required', 'maxLength'],
                    'glucosurie'             => ['type', 'required', 'enum'],
                    'acetone'                => ['type', 'required', 'enum'],
                    'cholesterol_total'      => ['type', 'required', 'min'],
                    'triglycerides'          => ['type', 'required', 'min'],
                    'hdl'                    => ['type', 'required', 'min'],
                    'ldl'                    => ['type', 'required', 'min'],
                    'examen_clinique'        => ['type', 'required'],
                    'diagnostic'             => ['type', 'required'],
                    'conduite_a_tenir'       => ['type', 'required'],
                    'prix'                   => ['type', 'required', 'min'],
                    'regle'                  => ['type', 'required'],
                ],
            ]);
    });

    it('marks patient_id and date_consultation as required', function () {
        $doctor = User::factory()->doctor()->create();

        $response = actingAs($doctor)
            ->getJson('/api/v1/doctor/consultations/validation-rules');

        expect($response->json('data.patient_id.required'))->toBeTrue();
        expect($response->json('data.date_consultation.required'))->toBeTrue();
        expect($response->json('data.poids.required'))->toBeFalse();
    });

    it('returns correct numeric constraints', function () {
        $doctor = User::factory()->doctor()->create();

        $response = actingAs($doctor)
            ->getJson('/api/v1/doctor/consultations/validation-rules');

        expect($response->json('data.temperature.min'))->toBe(30);
        expect($response->json('data.temperature.max'))->toBe(45);
        expect($response->json('data.poids.max'))->toBe(500);
        expect($response->json('data.hba1c.max'))->toBe(20);
        expect($response->json('data.saturation_o2.max'))->toBe(100);
        expect($response->json('data.tension_systolique.max'))->toBe(300);
        expect($response->json('data.tension_diastolique.max'))->toBe(200);
    });

    it('returns enum values for glucosurie and acetone', function () {
        $doctor = User::factory()->doctor()->create();

        $response = actingAs($doctor)
            ->getJson('/api/v1/doctor/consultations/validation-rules');

        expect($response->json('data.glucosurie.enum'))->toBe(['-', '+', '++', '+++']);
        expect($response->json('data.acetone.enum'))->toBe(['-', '+', '++', '+++']);
    });

    it('returns 401 for unauthenticated requests', function () {
        $this->getJson('/api/v1/doctor/consultations/validation-rules')
            ->assertUnauthorized();
    });

    it('returns 403 for a secretary', function () {
        $doctor    = User::factory()->doctor()->create();
        $secretary = User::factory()->secretary($doctor->tenant_id)->create();

        actingAs($secretary)
            ->getJson('/api/v1/doctor/consultations/validation-rules')
            ->assertForbidden();
    });
});
