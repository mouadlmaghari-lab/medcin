@extends('pdf.layout')

@section('title', 'Reçu de Paiement')

@section('content')
    <div class="doc-title">Reçu de Paiement</div>

    <div class="patient-info clearfix">
        <div style="float: left; width: 50%;">
            <strong>Patient :</strong> {{ $patient['nom_complet'] }}<br>
            @if(!empty($patient['numero_dossier']))
                <strong>Dossier :</strong> {{ $patient['numero_dossier'] }}
            @endif
        </div>
        <div style="float: right; width: 45%; text-align: right;">
            <strong>Reçu N° :</strong> {{ $numero }}<br>
            <strong>Date :</strong> {{ $date }}
        </div>
    </div>

    <div class="content">
        <div style="text-align: center; margin: 30px 0; padding: 20px; border: 2px solid #16a34a; background: #f0fdf4;">
            <p style="font-size: 10pt; color: #666;">Montant reçu</p>
            <p style="font-size: 24pt; font-weight: bold; color: #16a34a;">
                {{ number_format($montant, 2, ',', ' ') }} MAD
            </p>
            <p style="font-size: 10pt; color: #666; margin-top: 5px;">
                Mode : {{ $methode_paiement }}
            </p>
        </div>

        @if(!empty($consultation_type))
            <p><strong>Pour :</strong> {{ $consultation_type }}</p>
        @endif

        @if(!empty($reste))
            <p class="mt-2"><strong>Reste à payer :</strong> {{ number_format($reste, 2, ',', ' ') }} MAD</p>
        @endif
    </div>

    <div class="signature">
        <div class="signature-line">Dr. {{ $branding['doctor_name'] }}</div>
    </div>
@endsection
