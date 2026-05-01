<?php

/*
|--------------------------------------------------------------------------
| TabibCare — Pest Configuration
|--------------------------------------------------------------------------
|
| This file is used by Pest to configure:
|   - Base test cases for each suite
|   - Custom expectations
|   - Global helper functions for tests
|
*/

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

// Apply RefreshDatabase to all Feature tests automatically
uses(TestCase::class, RefreshDatabase::class)->in('Feature');

// Unit tests use the base TestCase only
uses(TestCase::class)->in('Unit');

/*
|--------------------------------------------------------------------------
| Custom Expectations
|--------------------------------------------------------------------------
*/

expect()->extend('toBeValidJwt', function () {
    $parts = explode('.', $this->value);
    expect(count($parts))->toBe(3);
    return $this;
});

expect()->extend('toBeValidApiResponse', function () {
    expect($this->value)->toHaveKeys(['data', 'message']);
    return $this;
});
