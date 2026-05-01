<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StoreExpertiseRequest;
use App\Http\Resources\ExpertiseResource;
use App\Models\Expertise;
use App\Models\ExpertiseAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class ExpertiseController extends Controller
{
    /**
     * List expertises with filters.
     * GET /api/v1/doctor/expertises?patient_id=&statut=&date_from=&date_to=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Expertise::query()
            ->with(['patient:id,nom_complet,numero_dossier', 'attachments'])
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->when($request->statut, fn ($q, $s) => $q->where('statut', $s))
            ->when($request->date_from, fn ($q, $d) => $q->where('date_expertise', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->where('date_expertise', '<=', $d))
            ->latest('date_expertise');

        $perPage = min($request->integer('per_page', 15), 100);

        return ExpertiseResource::collection($query->paginate($perPage));
    }

    /**
     * Create expertise with attachments.
     */
    public function store(StoreExpertiseRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Set default status
        $data['statut'] = $data['statut'] ?? 'en_cours';

        $expertise = Expertise::create($data);

        // Handle attachments
        if ($request->has('attachments')) {
            foreach ($request->file('attachments') as $file) {
                ExpertiseAttachment::create([
                    'expertise_id' => $expertise->id,
                    'file_name'    => $file->getClientOriginalName(),
                    'media_type'   => $file->getMimeType(),
                    'file_size'    => $file->getSize(),
                    'file_path'    => $file->store('expertises/' . $expertise->id, 's3'),
                ]);
            }
        }

        return (new ExpertiseResource($expertise->load(['patient', 'attachments'])))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show expertise with attachments.
     */
    public function show(Expertise $expertise): ExpertiseResource
    {
        $expertise->load(['patient', 'attachments']);

        return new ExpertiseResource($expertise);
    }

    /**
     * Update expertise (status, content).
     */
    public function update(StoreExpertiseRequest $request, Expertise $expertise): ExpertiseResource
    {
        $data = $request->validated();

        $expertise->update([
            'titre'           => $data['titre'],
            'contenu'         => $data['contenu'] ?? $expertise->contenu,
            'date_expertise'  => $data['date_expertise'],
            'statut'          => $data['statut'] ?? $expertise->statut,
        ]);

        // Handle new attachments
        if ($request->has('attachments')) {
            foreach ($request->file('attachments') as $file) {
                ExpertiseAttachment::create([
                    'expertise_id' => $expertise->id,
                    'file_name'    => $file->getClientOriginalName(),
                    'media_type'   => $file->getMimeType(),
                    'file_size'    => $file->getSize(),
                    'file_path'    => $file->store('expertises/' . $expertise->id, 's3'),
                ]);
            }
        }

        return new ExpertiseResource($expertise->fresh()->load(['patient', 'attachments']));
    }

    /**
     * Delete expertise and attachments.
     */
    public function destroy(Expertise $expertise): JsonResponse
    {
        // Delete attachments
        $expertise->attachments()->delete();

        $expertise->delete();

        return response()->json(['message' => 'Expertise supprimée.']);
    }

    /**
     * Delete a single attachment.
     * DELETE /api/v1/doctor/expertises/:expertise_id/attachments/:attachment_id
     */
    public function deleteAttachment(Expertise $expertise, ExpertiseAttachment $attachment): JsonResponse
    {
        if ($attachment->expertise_id !== $expertise->id) {
            throw ValidationException::withMessages([
                'attachment' => ['Attachement non trouvé.'],
            ]);
        }

        $attachment->delete();

        return response()->json(['message' => 'Attachement supprimé.']);
    }
}
