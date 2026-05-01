<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

describe('Doctor Login (Sanctum)', function () {

    it('logs in a doctor with valid credentials', function () {
        $doctor = User::factory()->create([
            'email'    => 'doctor@tabibcare.test',
            'password' => Hash::make('secret123'),
            'role'     => UserRole::DOCTOR,
            'active'   => true,
        ]);
        $doctor->assignRole(UserRole::DOCTOR->value);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'doctor@tabibcare.test',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['user', 'token', 'expires_at'],
                'message',
            ]);

        expect($response->json('data.user.role'))->toBe(UserRole::DOCTOR->value);
        expect($response->json('data.token'))->toBeString()->not->toBeEmpty();
    });

    it('returns 401 for invalid credentials', function () {
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'nobody@tabibcare.test',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Identifiants incorrects.']);
    });

    it('returns 403 for inactive account', function () {
        User::factory()->create([
            'email'    => 'inactive@tabibcare.test',
            'password' => Hash::make('secret123'),
            'role'     => UserRole::DOCTOR,
            'active'   => false,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'inactive@tabibcare.test',
            'password' => 'secret123',
        ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Ce compte est désactivé.']);
    });

    it('returns 422 for missing fields', function () {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    });

    it('can logout and revoke token', function () {
        $doctor = User::factory()->create([
            'email'    => 'logout@tabibcare.test',
            'password' => Hash::make('secret123'),
            'role'     => UserRole::DOCTOR,
            'active'   => true,
        ]);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email'    => 'logout@tabibcare.test',
            'password' => 'secret123',
        ]);

        $token = $loginResponse->json('data.token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout')
            ->assertStatus(200)
            ->assertJson(['message' => 'Déconnecté.']);

        // Token should be revoked now
        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/doctor/patients')
            ->assertStatus(401);
    });
});
