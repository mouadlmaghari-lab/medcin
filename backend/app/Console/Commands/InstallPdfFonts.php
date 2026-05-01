<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\File;

class InstallPdfFonts extends Command
{
    protected $signature = 'pdf:install-fonts {--force : Overwrite existing fonts}';

    protected $description = 'Download and install Arabic fonts (Amiri & Cairo) for PDF generation';

    /**
     * Google Fonts direct download URLs.
     * Amiri — Serif Arabic font, ideal for formal medical documents.
     * Cairo — Sans-serif Arabic font, clean for headers and UI text.
     */
    private array $fonts = [
        'amiri' => [
            'regular'   => 'https://github.com/aliftype/amiri/releases/download/1.000/Amiri-Regular.ttf',
            'bold'      => 'https://github.com/aliftype/amiri/releases/download/1.000/Amiri-Bold.ttf',
            'italic'    => 'https://github.com/aliftype/amiri/releases/download/1.000/Amiri-Italic.ttf',
            'bolditalic' => 'https://github.com/aliftype/amiri/releases/download/1.000/Amiri-BoldItalic.ttf',
        ],
        'cairo' => [
            'regular'   => 'https://github.com/google/fonts/raw/main/ofl/cairo/static/Cairo-Regular.ttf',
            'bold'      => 'https://github.com/google/fonts/raw/main/ofl/cairo/static/Cairo-Bold.ttf',
            'light'     => 'https://github.com/google/fonts/raw/main/ofl/cairo/static/Cairo-Light.ttf',
            'semibold'  => 'https://github.com/google/fonts/raw/main/ofl/cairo/static/Cairo-SemiBold.ttf',
        ],
    ];

    public function handle(): int
    {
        $fontsDir = resource_path('fonts');
        $storageDir = storage_path('fonts');
        $force = $this->option('force');

        // Ensure directories exist
        File::ensureDirectoryExists($fontsDir);
        File::ensureDirectoryExists($storageDir);

        $this->info('📥 Installing Arabic fonts for PDF generation...');
        $this->newLine();

        $downloaded = 0;
        $skipped = 0;

        foreach ($this->fonts as $family => $variants) {
            $this->info("  ▸ Font family: {$family}");

            foreach ($variants as $variant => $url) {
                $filename = ucfirst($family) . '-' . ucfirst($variant) . '.ttf';
                $localPath = $fontsDir . '/' . $filename;

                if (File::exists($localPath) && !$force) {
                    $this->line("    ✓ {$filename} (already exists, skipped)");
                    $skipped++;
                    continue;
                }

                $this->line("    ↓ Downloading {$filename}...");

                try {
                    $response = Http::timeout(30)->get($url);

                    if ($response->successful()) {
                        File::put($localPath, $response->body());
                        $this->line("    ✓ {$filename} downloaded (" . round(strlen($response->body()) / 1024) . " KB)");
                        $downloaded++;
                    } else {
                        $this->warn("    ✗ Failed to download {$filename} (HTTP {$response->status()})");
                    }
                } catch (\Exception $e) {
                    $this->warn("    ✗ Failed: {$e->getMessage()}");
                    $this->info("    → You can manually download from: {$url}");
                    $this->info("    → Place the file at: {$localPath}");
                }
            }
            $this->newLine();
        }

        // Now register fonts with DomPDF
        $this->info('📋 Registering fonts with DomPDF...');
        $this->registerFontsWithDomPdf($fontsDir);

        $this->newLine();
        $this->info("✅ Done! Downloaded: {$downloaded}, Skipped: {$skipped}");
        $this->info("   Font source: {$fontsDir}");
        $this->info("   DomPDF cache: {$storageDir}");

        return self::SUCCESS;
    }

    /**
     * Register downloaded fonts with DomPDF's font metrics system.
     */
    private function registerFontsWithDomPdf(string $fontsDir): void
    {
        $dompdf = new \Dompdf\Dompdf();
        $dompdf->getOptions()->set('fontDir', storage_path('fonts'));
        $dompdf->getOptions()->set('fontCache', storage_path('fonts'));

        $fontMetrics = $dompdf->getFontMetrics();

        $families = [
            'amiri' => [
                'normal'      => $fontsDir . '/Amiri-Regular.ttf',
                'bold'        => $fontsDir . '/Amiri-Bold.ttf',
                'italic'      => $fontsDir . '/Amiri-Italic.ttf',
                'bold_italic' => $fontsDir . '/Amiri-Bolditalic.ttf',
            ],
            'cairo' => [
                'normal'      => $fontsDir . '/Cairo-Regular.ttf',
                'bold'        => $fontsDir . '/Cairo-Bold.ttf',
            ],
        ];

        foreach ($families as $family => $variants) {
            $valid = true;
            foreach ($variants as $style => $path) {
                if (!File::exists($path)) {
                    $this->warn("  ⚠ Missing: {$path} — skipping {$family} registration");
                    $valid = false;
                    break;
                }
            }

            if ($valid) {
                try {
                    $fontMetrics->registerFont(
                        ['family' => $family, 'style' => 'normal', 'weight' => 'normal'],
                        $variants['normal']
                    );

                    if (isset($variants['bold'])) {
                        $fontMetrics->registerFont(
                            ['family' => $family, 'style' => 'normal', 'weight' => 'bold'],
                            $variants['bold']
                        );
                    }

                    if (isset($variants['italic'])) {
                        $fontMetrics->registerFont(
                            ['family' => $family, 'style' => 'italic', 'weight' => 'normal'],
                            $variants['italic']
                        );
                    }

                    if (isset($variants['bold_italic'])) {
                        $fontMetrics->registerFont(
                            ['family' => $family, 'style' => 'italic', 'weight' => 'bold'],
                            $variants['bold_italic']
                        );
                    }

                    $fontMetrics->saveFontFamilies();
                    $this->info("  ✓ Registered: {$family}");
                } catch (\Exception $e) {
                    $this->warn("  ✗ Failed to register {$family}: {$e->getMessage()}");
                }
            }
        }
    }
}
