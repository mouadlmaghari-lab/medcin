<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\File;

class PdfService
{
    /**
     * Default PDF options for A4 medical documents.
     */
    private array $defaults = [
        'paper'       => 'a4',
        'orientation' => 'portrait',
    ];

    /**
     * Supported locales and their text directions.
     */
    private array $rtlLocales = ['ar', 'he', 'fa', 'ur'];

    /**
     * Get cabinet branding data for the current tenant.
     */
    public function getCabinetBranding(?int $tenantId = null): array
    {
        $user = $tenantId
            ? \App\Models\User::find($tenantId)
            : auth()->user();

        if (!$user) {
            return $this->defaultBranding();
        }

        return [
            'cabinet_name' => $user->cabinet_name ?? 'Cabinet Médical',
            'doctor_name'  => $user->nom_complet ?? '',
            'specialite'   => $user->specialite ?? '',
            'inpe'         => $user->inpe ?? '',
            'telephone'    => $user->telephone ?? '',
            'adresse'      => $user->adresse ?? '',
            'ville'        => $user->ville ?? '',
            'email'        => $user->email ?? '',
            'logo_url'     => $user->logo_url ?? null,
        ];
    }

    /**
     * Default branding fallback.
     */
    private function defaultBranding(): array
    {
        return [
            'cabinet_name' => 'Cabinet Médical',
            'doctor_name'  => '',
            'specialite'   => '',
            'inpe'         => '',
            'telephone'    => '',
            'adresse'      => '',
            'ville'        => '',
            'email'        => '',
            'logo_url'     => null,
        ];
    }

    /**
     * Determine if the current locale is RTL.
     */
    public function isRtl(?string $locale = null): bool
    {
        $locale = $locale ?? app()->getLocale();

        return in_array($locale, $this->rtlLocales, true);
    }

    /**
     * Get the font family string based on locale.
     * Arabic uses Amiri (serif) or Cairo (sans-serif).
     * French/English use DejaVu Sans for full Unicode support.
     */
    public function getFontFamily(?string $locale = null): string
    {
        if ($this->isRtl($locale)) {
            return "'Amiri', 'Cairo', 'DejaVu Sans', serif";
        }

        return "'DejaVu Sans', sans-serif";
    }

    /**
     * Generate a PDF from a Blade view.
     *
     * @param  string  $view     Blade view path (e.g., 'pdf.ordonnance')
     * @param  array   $data     Data for the view
     * @param  array   $options  Override default options (paper, orientation, locale)
     * @return \Barryvdh\DomPDF\PDF
     */
    public function generate(string $view, array $data = [], array $options = [])
    {
        $merged = array_merge($this->defaults, $options);
        $locale = $merged['locale'] ?? app()->getLocale();

        // Inject global template variables
        $data['branding'] = $data['branding'] ?? $this->getCabinetBranding();
        $data['generated_at'] = now()->format('d/m/Y à H:i');
        $data['dir'] = $data['dir'] ?? ($this->isRtl($locale) ? 'rtl' : 'ltr');
        $data['lang'] = $data['lang'] ?? $locale;
        $data['font_family'] = $data['font_family'] ?? $this->getFontFamily($locale);

        $pdf = Pdf::loadView($view, $data)
            ->setPaper($merged['paper'], $merged['orientation']);

        return $pdf;
    }

    /**
     * Generate and return PDF as a download response.
     */
    public function download(string $view, array $data = [], string $filename = 'document.pdf', array $options = [])
    {
        return $this->generate($view, $data, $options)->download($filename);
    }

    /**
     * Generate and return PDF as inline (browser display).
     */
    public function stream(string $view, array $data = [], string $filename = 'document.pdf', array $options = [])
    {
        return $this->generate($view, $data, $options)->stream($filename);
    }

    /**
     * Generate and save PDF to storage, return path.
     */
    public function save(string $view, array $data = [], string $path = '', array $options = []): string
    {
        if (empty($path)) {
            $path = 'pdfs/' . uniqid('doc_') . '.pdf';
        }

        $this->generate($view, $data, $options)
            ->save(storage_path('app/' . $path));

        return $path;
    }

    /**
     * Check if Arabic fonts are installed.
     */
    public function hasArabicFonts(): bool
    {
        return File::exists(resource_path('fonts/Amiri-Regular.ttf'))
            || File::exists(resource_path('fonts/Cairo-Regular.ttf'));
    }

    // ── Convenience Methods ─────────────────────────────────────────────────

    /**
     * Generate ordonnance (prescription) PDF.
     */
    public function ordonnance(array $data, ?string $locale = null): \Barryvdh\DomPDF\PDF
    {
        return $this->generate('pdf.ordonnance', $data, ['locale' => $locale]);
    }

    /**
     * Generate certificat médical PDF.
     */
    public function certificat(array $data, ?string $locale = null): \Barryvdh\DomPDF\PDF
    {
        return $this->generate('pdf.certificat', $data, ['locale' => $locale]);
    }

    /**
     * Generate facture (invoice) PDF.
     */
    public function facture(array $data, ?string $locale = null): \Barryvdh\DomPDF\PDF
    {
        return $this->generate('pdf.facture', $data, ['locale' => $locale]);
    }

    /**
     * Generate reçu de paiement (receipt) PDF.
     */
    public function recu(array $data, ?string $locale = null): \Barryvdh\DomPDF\PDF
    {
        return $this->generate('pdf.recu', $data, ['locale' => $locale]);
    }

    /**
     * Generate rapport médical PDF.
     */
    public function rapport(array $data, ?string $locale = null): \Barryvdh\DomPDF\PDF
    {
        return $this->generate('pdf.rapport', $data, ['locale' => $locale]);
    }
}
