<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name'              => fake()->name(),
            'nom_complet'       => fake()->name(),
            'email'             => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password'          => static::$password ??= Hash::make('password'),
            'remember_token'    => Str::random(10),
            'role'              => UserRole::DOCTOR,
            'language'          => 'fr',
            'active'            => true,
            'tenant_id'         => null, // set after creation for doctors
        ];
    }

    /**
     * Doctor state — active doctor with their own tenant_id.
     */
    public function doctor(): static
    {
        return $this->state(fn (array $attributes) => [
            'role'   => UserRole::DOCTOR,
            'active' => true,
        ])->afterCreating(function (User $user) {
            $user->update(['tenant_id' => $user->id]);
            $user->assignRole(UserRole::DOCTOR->value);
        });
    }

    /**
     * Secretary state — linked to a doctor's tenant.
     */
    public function secretary(?int $tenantId = null): static
    {
        return $this->state(fn (array $attributes) => [
            'role'      => UserRole::SECRETARY,
            'tenant_id' => $tenantId,
            'active'    => true,
        ])->afterCreating(function (User $user) {
            $user->assignRole(UserRole::SECRETARY->value);
        });
    }

    /**
     * Patient state — for mobile app users.
     */
    public function patient(): static
    {
        return $this->state(fn (array $attributes) => [
            'role'      => UserRole::PATIENT,
            'tenant_id' => null,
            'active'    => true,
        ])->afterCreating(function (User $user) {
            $user->assignRole(UserRole::PATIENT->value);
        });
    }

    /**
     * Inactive account state.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['active' => false]);
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => ['email_verified_at' => null]);
    }
}
