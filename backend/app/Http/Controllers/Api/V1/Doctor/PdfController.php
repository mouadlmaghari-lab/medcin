<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Consultation;
use App\Models\Invoice;
use App\Models\MedicalReport;
use App\Models\Payment;
use App\Models\Prescription;
use App\Services\PdfService;
use Illuminate\Http\Request;

class PdfController extends Controller
{
    public function __construct(
        private readonly PdfService $pdf,
    ) {}

    /**
     * GET /pdf/ordonnance/{prescription}
     * Stream prescription PDF inline (opens in browser).
     */
    public function ordonnance(Prescription $prescription)
    {
        $prescription->load([
            'patient:id,nom_complet,date_naissance,telephone,cin,numero_dossier',
            'medications',
        ]);

        $data = [
            'prescription' => $prescription,
            'patient'      => $prescription->patient,
            'medications'  => $prescription->medications ?? [],
            'notes'        => $prescription->notes,
        ];

        $filename = "ordonnance-{$prescription->id}-" . now()->format('Ymd') . '.pdf';

        return $this->pdf->stream('pdf.ordonnance', $data, $filename);
    }

    /**
     * GET /pdf/certificat/{certificate}
     * Stream medical certificate PDF.
     */
    public function certificat(Certificate $certificate)
    {
        $certificate->load('patient:id,nom_complet,date_naissance,cin,numero_dossier');

        $data = [
            'certificate' => $certificate,
            'patient'     => $certificate->patient,
        ];

        $filename = "certificat-{$certificate->id}-" . now()->format('Ymd') . '.pdf';

        return $this->pdf->stream('pdf.certificat', $data, $filename);
    }

    /**
     * GET /pdf/facture/{invoice}
     * Stream invoice PDF.
     */
    public function facture(Invoice $invoice)
    {
        $invoice->load([
            'patient:id,nom_complet,telephone,cin,numero_dossier,adresse',
            'items',
        ]);

        $data = [
            'invoice' => $invoice,
            'patient' => $invoice->patient,
            'items'   => $invoice->items ?? [],
        ];

        $filename = "facture-{$invoice->numero}-" . now()->format('Ymd') . '.pdf';

        return $this->pdf->stream('pdf.facture', $data, $filename);
    }

    /**
     * GET /pdf/recu/{payment}
     * Stream payment receipt PDF.
     */
    public function recu(Payment $payment)
    {
        $payment->load('patient:id,nom_complet,telephone,cin,numero_dossier');

        $data = [
            'payment' => $payment,
            'patient' => $payment->patient,
        ];

        $filename = "recu-{$payment->numero_recu}-" . now()->format('Ymd') . '.pdf';

        return $this->pdf->stream('pdf.recu', $data, $filename);
    }

    /**
     * GET /pdf/rapport/{report}
     * Stream medical report PDF.
     */
    public function rapport(MedicalReport $report)
    {
        $report->load('patient:id,nom_complet,date_naissance,cin,numero_dossier');

        $data = [
            'report'  => $report,
            'patient' => $report->patient,
        ];

        $filename = "rapport-{$report->id}-" . now()->format('Ymd') . '.pdf';

        return $this->pdf->stream('pdf.rapport', $data, $filename);
    }

    /**
     * GET /pdf/consultation/{consultation}
     * Stream full consultation summary PDF (all-in-one doc).
     */
    public function consultation(Consultation $consultation)
    {
        $consultation->load([
            'patient:id,nom_complet,date_naissance,telephone,cin,numero_dossier,sexe,groupe_sanguin',
            'prescriptions.medications',
            'certificates',
        ]);

        $data = [
            'consultation' => $consultation,
            'patient'      => $consultation->patient,
        ];

        $filename = "consultation-{$consultation->id}-" . now()->format('Ymd') . '.pdf';

        return $this->pdf->stream('pdf.consultation', $data, $filename);
    }

    /**
     * POST /pdf/download
     * Explicit download (save-as) for any document type.
     */
    public function downloadAny(Request $request)
    {
        $request->validate([
            'type' => 'required|in:ordonnance,certificat,facture,recu,rapport',
            'id'   => 'required|integer',
        ]);

        $method = $request->type;

        // Resolve the model
        $model = match ($method) {
            'ordonnance' => Prescription::findOrFail($request->id),
            'certificat' => Certificate::findOrFail($request->id),
            'facture'    => Invoice::findOrFail($request->id),
            'recu'       => Payment::findOrFail($request->id),
            'rapport'    => MedicalReport::findOrFail($request->id),
        };

        // Re-use the stream methods but return as download
        $response = $this->{$method}($model);

        // Change Content-Disposition from inline to attachment
        $response->headers->set(
            'Content-Disposition',
            str_replace('inline', 'attachment', $response->headers->get('Content-Disposition'))
        );

        return $response;
    }
}
