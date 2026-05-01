<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Certificate;
use App\Models\Consultation;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Prescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    /**
     * Get overall dashboard statistics.
     * GET /api/v1/doctor/statistics/dashboard
     */
    public function dashboard(Request $request): JsonResponse
    {
        $from = $request->date('from', now()->startOfMonth());
        $to = $request->date('to', now()->endOfMonth());

        return response()->json([
            'patients'        => $this->getPatientStats(),
            'appointments'    => $this->getAppointmentStats($from, $to),
            'consultations'   => $this->getConsultationStats($from, $to),
            'revenue'         => $this->getRevenueStats($from, $to),
            'prescriptions'   => $this->getPrescriptionStats($from, $to),
            'certificates'    => $this->getCertificateStats($from, $to),
        ]);
    }

    /**
     * Get patient statistics.
     */
    private function getPatientStats(): array
    {
        return [
            'total'    => Patient::count(),
            'active'   => Patient::where('active', true)->count(),
            'inactive' => Patient::where('active', false)->count(),
        ];
    }

    /**
     * Get appointment statistics for date range.
     */
    private function getAppointmentStats($from, $to): array
    {
        $query = Appointment::whereBetween('debut', [$from, $to]);

        return [
            'total'     => $query->clone()->count(),
            'completed' => $query->clone()->where('etat', 'realise')->count(),
            'pending'   => $query->clone()->where('etat', 'en_attente')->count(),
            'cancelled' => $query->clone()->where('etat', 'annule')->count(),
            'no_show'   => $query->clone()->where('etat', 'absent')->count(),
        ];
    }

    /**
     * Get consultation statistics for date range.
     */
    private function getConsultationStats($from, $to): array
    {
        $query = Consultation::whereBetween('date_consultation', [$from, $to]);

        return [
            'total'        => $query->clone()->count(),
            'by_type'      => $query->clone()
                ->groupBy('type')
                ->selectRaw('type, COUNT(*) as count')
                ->pluck('count', 'type')
                ->toArray(),
            'average_time' => round($query->clone()
                ->avg(DB::raw('TIMESTAMPDIFF(MINUTE, debut, fin)')) ?? 0),
        ];
    }

    /**
     * Get revenue statistics (payments and invoices).
     */
    private function getRevenueStats($from, $to): array
    {
        $payments = Payment::whereBetween('date_paiement', [$from, $to]);
        $invoices = Invoice::whereBetween('date_facture', [$from, $to]);

        return [
            'total_payments'   => round($payments->clone()->sum('montant'), 2),
            'payment_count'    => $payments->clone()->count(),
            'total_invoiced'   => round($invoices->clone()->sum('montant'), 2),
            'invoice_count'    => $invoices->clone()->count(),
            'pending_payments' => round($invoices->clone()
                ->where('statut', 'en_attente')
                ->sum('montant'), 2),
        ];
    }

    /**
     * Get prescription statistics for date range.
     */
    private function getPrescriptionStats($from, $to): array
    {
        $query = Prescription::whereBetween('date_ordonnance', [$from, $to]);

        return [
            'total' => $query->clone()->count(),
            'by_type' => $query->clone()
                ->groupBy('type')
                ->selectRaw('type, COUNT(*) as count')
                ->pluck('count', 'type')
                ->toArray(),
        ];
    }

    /**
     * Get certificate statistics for date range.
     */
    private function getCertificateStats($from, $to): array
    {
        $query = Certificate::whereBetween('date_certificat', [$from, $to]);

        return [
            'total' => $query->clone()->count(),
            'by_type' => $query->clone()
                ->groupBy('type')
                ->selectRaw('type, COUNT(*) as count')
                ->pluck('count', 'type')
                ->toArray(),
        ];
    }

    /**
     * Get detailed appointment trends.
     * GET /api/v1/doctor/statistics/appointments?from=&to=
     */
    public function appointmentTrends(Request $request): JsonResponse
    {
        $from = $request->date('from', now()->subDays(30));
        $to = $request->date('to', now());

        $trends = Appointment::whereBetween('debut', [$from, $to])
            ->selectRaw('DATE(debut) as date, COUNT(*) as count, etat')
            ->groupBy('date', 'etat')
            ->orderBy('date')
            ->get()
            ->groupBy('date')
            ->map(fn ($group) => [
                'date' => $group->first()->date,
                'total' => $group->sum('count'),
                'by_status' => $group->pluck('count', 'etat')->toArray(),
            ])
            ->values();

        return response()->json(['data' => $trends]);
    }

    /**
     * Get revenue trends.
     * GET /api/v1/doctor/statistics/revenue?from=&to=
     */
    public function revenueTrends(Request $request): JsonResponse
    {
        $from = $request->date('from', now()->subDays(30));
        $to = $request->date('to', now());

        $trends = Payment::whereBetween('date_paiement', [$from, $to])
            ->selectRaw('DATE(date_paiement) as date, SUM(montant) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'amount' => round($row->total, 2),
            ])
            ->values();

        return response()->json(['data' => $trends]);
    }

    /**
     * Get top procedures/treatments.
     * GET /api/v1/doctor/statistics/top-procedures?limit=10
     */
    public function topProcedures(Request $request): JsonResponse
    {
        $limit = min($request->integer('limit', 10), 50);

        $procedures = Consultation::selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->orderByRaw('count DESC')
            ->limit($limit)
            ->get()
            ->pluck('count', 'type');

        return response()->json(['data' => $procedures]);
    }
}
