<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default filesystem disk that should be used
    | by the framework. The "local" disk, as well as a variety of cloud
    | based disks are available to your application for file storage.
    |
    */

    'default' => env('FILESYSTEM_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Below you may configure as many filesystem disks as necessary, and you
    | may even configure multiple disks for the same driver. Examples for
    | most supported storage drivers are configured here for reference.
    |
    | Supported drivers: "local", "ftp", "sftp", "s3"
    |
    */

    'disks' => [

        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => true,
            'throw' => false,
            'report' => false,
        ],

        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => rtrim(env('APP_URL', 'http://localhost'), '/').'/storage',
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],

        // Backblaze B2 via S3-compatible API (used by Spatie Medialibrary)
        // Bucket structure: /{tenant_id}/{patient_id}/{category}/{filename}
        's3' => [
            'driver'                  => 's3',
            'key'                     => env('BACKBLAZE_KEY_ID'),
            'secret'                  => env('BACKBLAZE_APPLICATION_KEY'),
            'region'                  => env('BACKBLAZE_REGION', 'us-west-004'),
            'bucket'                  => env('BACKBLAZE_BUCKET', 'tabibcare-files'),
            'endpoint'                => env('BACKBLAZE_ENDPOINT'),
            'use_path_style_endpoint' => true, // Required for B2 S3-compatible API
            'throw'                   => false,
            'report'                  => false,
            'visibility'              => 'private', // All files are private; served via pre-signed URLs
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | Here you may configure the symbolic links that will be created when the
    | `storage:link` Artisan command is executed. The array keys should be
    | the locations of the links and the values should be their targets.
    |
    */

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
