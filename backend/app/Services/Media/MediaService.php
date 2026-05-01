<?php

namespace App\Services\Media;

use App\Models\Patient;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaService
{
    /**
     * Pre-signed URL expiry in minutes (15 min default for security).
     */
    private const PRESIGNED_TTL_MINUTES = 15;

    /**
     * Allowed MIME types for patient analyses.
     */
    public const ANALYSES_ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];

    /**
     * Upload a file to a model's media collection (Backblaze B2 via S3).
     *
     * @param HasMedia $model   The Eloquent model (Patient, User, etc.)
     * @param UploadedFile $file
     * @param string $collection  Media collection name (e.g., 'patient-photos', 'analyses')
     * @param array $customProps  Optional custom properties to store with the media
     */
    public function upload(
        HasMedia $model,
        UploadedFile $file,
        string $collection,
        array $customProps = []
    ): Media {
        $safeFilename = $this->sanitizeFilename($file->getClientOriginalName());

        $media = $model
            ->addMedia($file)
            ->usingFileName($safeFilename)
            ->withCustomProperties($customProps)
            ->toMediaCollection($collection, 's3');

        return $media;
    }

    /**
     * Get a pre-signed URL for a media item (15-minute expiry).
     * Never serve files via public URLs — always use pre-signed.
     */
    public function getPresignedUrl(Media $media, ?int $ttlMinutes = null): string
    {
        $ttl = $ttlMinutes ?? self::PRESIGNED_TTL_MINUTES;

        return $media->getTemporaryUrl(now()->addMinutes($ttl));
    }

    /**
     * Get pre-signed URLs for all media in a collection.
     *
     * @return array<array{id: int, filename: string, url: string, created_at: string}>
     */
    public function getPresignedUrlsForCollection(HasMedia $model, string $collection, ?int $ttlMinutes = null): array
    {
        return $model->getMedia($collection)->map(function (Media $media) use ($ttlMinutes) {
            return [
                'id'         => $media->id,
                'uuid'       => $media->uuid,
                'filename'   => $media->file_name,
                'mime_type'  => $media->mime_type,
                'size'       => $media->size,
                'url'        => $this->getPresignedUrl($media, $ttlMinutes),
                'created_at' => $media->created_at->toIso8601String(),
            ];
        })->toArray();
    }

    /**
     * Validate and upload a patient analysis file.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function uploadPatientAnalysis(Patient $patient, UploadedFile $file): Media
    {
        // Validate file type
        if (! in_array($file->getMimeType(), self::ANALYSES_ALLOWED_MIMES)) {
            throw new \InvalidArgumentException(
                'Format non supporté. Formats acceptés: PDF, JPEG, PNG.'
            );
        }

        // Validate file size (10 MB max)
        if ($file->getSize() > 10 * 1024 * 1024) {
            throw new \InvalidArgumentException(
                'Fichier trop volumineux. Taille maximale: 10 MB.'
            );
        }

        return $this->upload($patient, $file, 'analyses', [
            'uploaded_by' => 'patient',
            'uploaded_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Sanitize filename to prevent path traversal and special chars.
     */
    private function sanitizeFilename(string $filename): string
    {
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        $name      = pathinfo($filename, PATHINFO_FILENAME);

        // Remove special characters, replace spaces with hyphens
        $safeName = Str::slug($name, '-');

        // Fallback for empty names
        if (empty($safeName)) {
            $safeName = Str::uuid();
        }

        return $safeName . '.' . strtolower($extension);
    }
}
