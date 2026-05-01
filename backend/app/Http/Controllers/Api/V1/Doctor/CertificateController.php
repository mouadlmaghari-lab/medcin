<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StoreCertificateRequest;
use App\Http\Resources\CertificateResource;
use App\Models\Certificate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CertificateController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Certificate::query()
            ->with('patient:id,nom_complet,telephone,numero_dossier')
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->when($request->type, fn ($q, $t) => $q->where('type', $t))
            ->latest('date_certificat');

        return CertificateResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    public function store(StoreCertificateRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Auto-number: CERT-YYYY-XXXX per doctor
        $year = now()->year;
        $tenantId = auth()->user()->effectiveTenantId();
        $count = Certificate::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->whereYear('date_certificat', $year)
            ->count();
        $data['numero'] = 'CERT-' . $year . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);

        $certificate = Certificate::create($data);

        return (new CertificateResource($certificate->load('patient')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Certificate $certificate): CertificateResource
    {
        $certificate->load('patient');

        return new CertificateResource($certificate);
    }

    public function update(StoreCertificateRequest $request, Certificate $certificate): CertificateResource
    {
        $certificate->update($request->validated());

        return new CertificateResource($certificate->fresh()->load('patient'));
    }

    public function destroy(Certificate $certificate): JsonResponse
    {
        $certificate->delete();

        return response()->json(['message' => 'Certificat supprimé.']);
    }
}
