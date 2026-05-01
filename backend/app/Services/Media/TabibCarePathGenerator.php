<?php

namespace App\Services\Media;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\PathGenerator;

/**
 * Custom path generator for Backblaze B2 / Spatie Medialibrary.
 *
 * Bucket structure:
 *   /{tenant_id}/{patient_id}/{collection}/{filename}
 *   /{tenant_id}/cabinet/{collection}/{filename}   ← for non-patient media (logos, stamps)
 *
 * Examples:
 *   /5/42/analyses/blood-test-result.pdf
 *   /5/42/patient-photos/avatar.jpg
 *   /5/cabinet/logos/clinic-logo.png
 */
class TabibCarePathGenerator implements PathGenerator
{
    /**
     * Get path for the original file.
     */
    public function getPath(Media $media): string
    {
        return $this->buildBasePath($media) . '/';
    }

    /**
     * Get path for responsive image variants.
     */
    public function getPathForResponsiveImages(Media $media): string
    {
        return $this->buildBasePath($media) . '/responsive/';
    }

    /**
     * Get path for conversion versions (thumbnails, etc.)
     */
    public function getPathForConversions(Media $media): string
    {
        return $this->buildBasePath($media) . '/conversions/';
    }

    private function buildBasePath(Media $media): string
    {
        $model = $media->model;

        // Determine tenant_id
        $tenantId = match(true) {
            $model instanceof \App\Models\Patient => $model->tenant_id,
            $model instanceof \App\Models\User    => $model->id,    // Doctor's own files
            default                               => 'shared',
        };

        // Determine entity path
        $entityPath = match(true) {
            $model instanceof \App\Models\Patient => $model->id,
            $model instanceof \App\Models\User    => 'cabinet',
            default                               => 'other',
        };

        // Collection-based category mapping
        $collection = $media->collection_name ?: 'files';

        return "{$tenantId}/{$entityPath}/{$collection}";
    }
}
