# Laravel Best Practices — TabibCare Backend Skill

> 42 rules across 7 categories for Laravel 11 / PHP 8.3 medical SaaS APIs.
> Priority: Eloquent Performance (CRITICAL) → Security (CRITICAL) → API Design (HIGH) →
> Multi-Tenancy (HIGH) → Queue & Jobs (MEDIUM) → Testing (MEDIUM) → Database (MEDIUM).

---

## 1. Eloquent Performance (CRITICAL) — 8 rules

### 1.1 Always eager-load relationships
```php
// ✗ N+1 — triggers a query per patient's consultations
$patients = Patient::all();
foreach ($patients as $p) { $p->consultations; }

// ✓ Eager load — 2 queries total
$patients = Patient::with('consultations')->get();
```

### 1.2 Use `select()` to limit columns
```php
// ✗ Fetches all 30+ columns including encrypted fields
Patient::with('consultations')->get();

// ✓ Only what the list view needs
Patient::select('id', 'nom', 'prenom', 'telephone', 'date_naissance')
    ->with('consultations:id,patient_id,date_consultation,motif')
    ->get();
```

### 1.3 Use `chunk()` or `lazy()` for large datasets
```php
// ✗ Loads 50k records into memory
Patient::all()->each(fn ($p) => $p->anonymize());

// ✓ Process in chunks of 500
Patient::chunk(500, fn ($patients) => $patients->each->anonymize());

// ✓ Or lazy collection for streaming
Patient::lazy()->each(fn ($p) => $p->anonymize());
```

### 1.4 Avoid `withCount` in loops — preload counts
```php
// ✗ Subquery per iteration
$doctors->each(fn ($d) => $d->loadCount('patients'));

// ✓ Single query with counts
Doctor::withCount('patients')->get();
```

### 1.5 Use database-level aggregation, not collection methods
```php
// ✗ Loads all payments into PHP to sum
Payment::where('doctor_id', $id)->get()->sum('montant');

// ✓ MySQL does the math
Payment::where('doctor_id', $id)->sum('montant');
```

### 1.6 Index foreign keys and frequently filtered columns
Every migration that adds `tenant_id`, `patient_id`, `doctor_id`, `date_consultation`,
`telephone`, or `cin` MUST include an index. Compound indexes for common query combos:
```php
$table->index(['tenant_id', 'date_consultation']); // Agenda queries
$table->index(['tenant_id', 'patient_id']);         // Patient-scoped lookups
```

### 1.7 Use `when()` for conditional query building
```php
// ✗ Messy if/else blocks
$query = Patient::query();
if ($request->search) { $query->where('nom', 'like', "%{$request->search}%"); }

// ✓ Clean conditional chaining
Patient::query()
    ->when($request->search, fn ($q, $s) => $q->where('nom', 'like', "%{$s}%"))
    ->when($request->city, fn ($q, $c) => $q->where('ville', $c))
    ->paginate(15);
```

### 1.8 Never use `DB::raw()` without parameter binding
```php
// ✗ SQL injection risk
DB::select(DB::raw("SELECT * FROM patients WHERE cin = '{$cin}'"));

// ✓ Parameterized
DB::select('SELECT * FROM patients WHERE cin = ?', [$cin]);

// ✓ Or better — use Eloquent
Patient::where('cin', $cin)->first();
```

---

## 2. Security (CRITICAL) — 7 rules

### 2.1 Always use Form Requests for validation
```php
// ✗ Inline validation in controller — hard to reuse, easy to forget
$request->validate(['nom' => 'required']);

// ✓ Dedicated Form Request
class StorePatientRequest extends FormRequest {
    public function rules(): array {
        return [
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'regex:/^(06|07|05)\d{8}$/'],
            'cin' => ['nullable', 'string', 'max:20'],
        ];
    }
}
```

### 2.2 Authorize at the Form Request level
```php
public function authorize(): bool
{
    return $this->user()->can('create', Patient::class);
}
```
Never skip authorization. Every endpoint must check permissions.

### 2.3 Never trust client-supplied `tenant_id`
```php
// ✗ Client can send any tenant_id
$data = $request->validated(); // includes tenant_id from body

// ✓ Always set from auth context
$data = $request->validated();
$data['tenant_id'] = auth()->user()->tenant_id;
```

### 2.4 Use Policies for model-level authorization
```php
// ✗ Inline role check
if ($user->role !== 'doctor') { abort(403); }

// ✓ Policy — testable, reusable, respects Spatie Permission
class PatientPolicy {
    public function view(User $user, Patient $patient): bool {
        return $user->tenant_id === $patient->tenant_id
            && $user->can('view patients');
    }
}
```

### 2.5 Encrypt sensitive fields at application level
```php
// In Patient model — CIN and medical data encrypted at rest
protected $casts = [
    'cin' => 'encrypted',
    'antecedents' => 'encrypted',
    'allergies' => 'encrypted',
];
```

### 2.6 Rate-limit authentication endpoints
```php
// routes/api.php
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
});
```

### 2.7 Never log sensitive data
```php
// ✗ CIN in logs — violates Law 09-08
Log::info('Patient created', ['cin' => $patient->cin]);

// ✓ Log only safe identifiers
Log::info('Patient created', ['patient_id' => $patient->id]);
```

---

## 3. API Design (HIGH) — 7 rules

### 3.1 Consistent JSON envelope on every response
```php
// All responses MUST follow this envelope
return response()->json([
    'data' => PatientResource::make($patient),
    'message' => __('patients.created'),
], 201);

// Collection with pagination meta
return PatientResource::collection($patients); // auto-wraps with data + meta
```

### 3.2 Always use API Resources — never return models directly
```php
// ✗ Exposes all columns, including encrypted, timestamps, pivots
return response()->json($patient);

// ✓ Controlled shape
class PatientResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'full_name' => $this->nom . ' ' . $this->prenom,
            'telephone' => $this->telephone,
            'date_naissance' => $this->date_naissance?->format('Y-m-d'),
            'age' => $this->date_naissance?->age,
            'consultations_count' => $this->whenCounted('consultations'),
            'derniere_consultation' => $this->whenLoaded('latestConsultation',
                fn () => ConsultationResource::make($this->latestConsultation)),
        ];
    }
}
```

### 3.3 Paginate all list endpoints — default 15 per page
```php
// ✗ No pagination — will crash on 10k patients
Patient::all();

// ✓ Always paginate
Patient::query()->paginate($request->input('per_page', 15));
```

### 3.4 Use Spatie Query Builder for filtering/sorting
```php
use Spatie\QueryBuilder\QueryBuilder;

$patients = QueryBuilder::for(Patient::class)
    ->allowedFilters(['nom', 'ville', 'sexe', AllowedFilter::scope('search')])
    ->allowedSorts(['nom', 'date_naissance', 'created_at'])
    ->allowedIncludes(['consultations', 'reglements'])
    ->paginate(15);
```

### 3.5 Version your API routes
```php
// routes/api.php — always v1 prefix
Route::prefix('v1')->group(function () {
    Route::prefix('doctor')->middleware(['auth:sanctum', 'role:doctor'])->group(/* ... */);
    Route::prefix('assistant')->middleware(['auth:sanctum', 'role:assistant'])->group(/* ... */);
    Route::prefix('patient')->middleware(['auth:api'])->group(/* ... */); // JWT
});
```

### 3.6 Return proper HTTP status codes
| Action | Success | Error |
|---|---|---|
| Create | 201 Created | 422 Validation |
| Read | 200 OK | 404 Not Found |
| Update | 200 OK | 422 Validation / 403 Forbidden |
| Delete | 204 No Content | 403 Forbidden |
| Auth fail | — | 401 Unauthorized |

### 3.7 Use route model binding with scoped queries
```php
// routes/api.php — auto-resolves and scope-checks
Route::get('patients/{patient}/consultations/{consultation}', [ConsultationController::class, 'show'])
    ->scopeBindings(); // ensures consultation belongs to patient
```

---

## 4. Multi-Tenancy (HIGH) — 5 rules

### 4.1 Every tenant-scoped model uses the BelongsToTenant trait
```php
trait BelongsToTenant {
    protected static function bootBelongsToTenant(): void {
        static::addGlobalScope('tenant', function ($builder) {
            if ($tenantId = auth()->user()?->tenant_id) {
                $builder->where($builder->getModel()->getTable() . '.tenant_id', $tenantId);
            }
        });
        static::creating(function ($model) {
            $model->tenant_id ??= auth()->user()?->tenant_id;
        });
    }
}
```

### 4.2 Never call `withoutGlobalScopes()` in production code
The only valid use is in artisan commands for admin/migration purposes.

### 4.3 Test tenant isolation explicitly
```php
test('doctor cannot see other tenant patients', function () {
    $doctor = Doctor::factory()->create(['tenant_id' => 1]);
    Patient::factory()->create(['tenant_id' => 2]); // other tenant

    actingAs($doctor);
    $response = getJson('/api/v1/doctor/patients');
    expect($response->json('data'))->toBeEmpty();
});
```

### 4.4 Include tenant_id in all unique constraints
```php
// ✗ Globally unique — blocks different tenants from same value
$table->unique('reference_number');

// ✓ Unique per tenant
$table->unique(['tenant_id', 'reference_number']);
```

### 4.5 Seed test data with multiple tenants
Always create at least 2 tenants in test factories to catch cross-tenant leaks.

---

## 5. Queue & Jobs (MEDIUM) — 5 rules

### 5.1 Use jobs for anything over 500ms
PDF generation, email sending, notification dispatch, Excel export, Meilisearch indexing.

### 5.2 Make jobs idempotent
```php
class GeneratePrescriptionPdf implements ShouldQueue {
    public $tries = 3;
    public $backoff = [10, 30, 60];

    public function handle(): void {
        // Check if already generated (idempotent)
        if ($this->prescription->hasMedia('pdf')) { return; }
        // Generate...
    }
}
```

### 5.3 Use specific queues for different priorities
```php
// High priority — user is waiting
dispatch(new SendSmsVerification($patient))->onQueue('high');

// Default — background work
dispatch(new GeneratePrescriptionPdf($prescription))->onQueue('default');

// Low priority — analytics, reports
dispatch(new RecalculateMonthlyStats($tenant))->onQueue('low');
```

### 5.4 Always set `$tries` and `$backoff`
Never leave a job with infinite retries. Medical data jobs should fail loudly.

### 5.5 Log job failures for monitoring
```php
public function failed(\Throwable $exception): void {
    Log::error('PDF generation failed', [
        'prescription_id' => $this->prescription->id,
        'error' => $exception->getMessage(),
    ]);
}
```

---

## 6. Testing with Pest (MEDIUM) — 6 rules

### 6.1 Test every controller action
One test file per controller. Cover: happy path, validation errors, authorization, tenant isolation.

### 6.2 Use `actingAs()` for auth — never generate tokens in tests
```php
test('doctor can create patient', function () {
    $doctor = Doctor::factory()->create();
    actingAs($doctor)
        ->postJson('/api/v1/doctor/patients', $validData)
        ->assertCreated()
        ->assertJsonStructure(['data' => ['id', 'nom', 'prenom']]);
});
```

### 6.3 Use datasets for validation coverage
```php
dataset('invalid_patient_data', [
    'missing nom' => [['nom' => ''], 'nom'],
    'invalid phone' => [['telephone' => '123'], 'telephone'],
    'future birthdate' => [['date_naissance' => '2030-01-01'], 'date_naissance'],
]);

test('rejects invalid patient data', function (array $override, string $errorField) {
    $data = array_merge($validData, $override);
    actingAs($doctor)
        ->postJson('/api/v1/doctor/patients', $data)
        ->assertUnprocessable()
        ->assertJsonValidationErrors($errorField);
})->with('invalid_patient_data');
```

### 6.4 Test role-based access for every endpoint
```php
test('assistant cannot access consultations', function () {
    $assistant = User::factory()->assistant()->create();
    actingAs($assistant)
        ->getJson('/api/v1/doctor/consultations')
        ->assertForbidden();
});
```

### 6.5 Use `RefreshDatabase` trait — never test against real data
```php
uses(RefreshDatabase::class);
```

### 6.6 Assert exact JSON structure, not just status
```php
// ✗ Too loose
$response->assertOk();

// ✓ Assert shape matches the API Resource
$response->assertOk()
    ->assertJsonStructure([
        'data' => ['id', 'nom', 'prenom', 'telephone', 'date_naissance'],
        'message',
    ]);
```

---

## 7. Database & Migrations (MEDIUM) — 4 rules

### 7.1 Never modify existing migrations — create new ones
```bash
php artisan make:migration add_blood_type_to_patients_table
```

### 7.2 Always add `tenant_id` foreign key on tenant-scoped tables
```php
$table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
```

### 7.3 Use ENUMs sparingly — prefer string columns with validation
```php
// ✗ MySQL ENUM — hard to migrate
$table->enum('sexe', ['M', 'F']);

// ✓ String + validation rule
$table->string('sexe', 1); // Validate in Form Request: Rule::in(['M', 'F'])
```

### 7.4 Use soft deletes for medical records
```php
// Patient, Consultation, Prescription — never hard delete
$table->softDeletes();
```
Hard deletes only for non-medical data (expenses, temporary records).
