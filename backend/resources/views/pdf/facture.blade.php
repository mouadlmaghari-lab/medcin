@extends('pdf.layout')

@section('title', 'Facture')

@section('content')
    <div class="doc-title">Facture</div>

    {{-- Invoice + Patient Info --}}
    <div class="patient-info clearfix">
        <div style="float: left; width: 50%;">
            <strong>Patient :</strong> {{ $patient['nom_complet'] }}<br>
            @if(!empty($patient['adresse']))<span class="text-sm">{{ $patient['adresse'] }}</span><br>@endif
            @if(!empty($patient['telephone']))<span class="text-sm">Tél: {{ $patient['telephone'] }}</span>@endif
        </div>
        <div style="float: right; width: 45%; text-align: right;">
            <strong>Facture N° :</strong> {{ $numero }}<br>
            <strong>Date :</strong> {{ $date }}<br>
            @if(!empty($patient['numero_dossier']))
                <strong>Dossier :</strong> {{ $patient['numero_dossier'] }}
            @endif
        </div>
    </div>

    {{-- Line Items --}}
    <div class="content">
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 45%;">Désignation</th>
                    <th style="width: 15%;" class="text-center">Qté</th>
                    <th style="width: 15%;" class="text-right">P.U. (MAD)</th>
                    <th style="width: 20%;" class="text-right">Total (MAD)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($lignes as $i => $ligne)
                <tr>
                    <td class="text-center">{{ $i + 1 }}</td>
                    <td>{{ $ligne['designation'] }}</td>
                    <td class="text-center">{{ $ligne['quantite'] }}</td>
                    <td class="text-right">{{ number_format($ligne['prix_unitaire'], 2, ',', ' ') }}</td>
                    <td class="text-right">{{ number_format($ligne['total'], 2, ',', ' ') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        {{-- Totals --}}
        <table style="width: 50%; margin-left: auto;">
            <tr>
                <td><strong>Total HT</strong></td>
                <td class="text-right">{{ number_format($total_ht, 2, ',', ' ') }} MAD</td>
            </tr>
            @if(($tva ?? 0) > 0)
            <tr>
                <td>TVA ({{ $taux_tva ?? 20 }}%)</td>
                <td class="text-right">{{ number_format($tva, 2, ',', ' ') }} MAD</td>
            </tr>
            @endif
            <tr style="background: #16a34a; color: white;">
                <td><strong>Total TTC</strong></td>
                <td class="text-right"><strong>{{ number_format($total_ttc, 2, ',', ' ') }} MAD</strong></td>
            </tr>
        </table>

        @if(!empty($mode_paiement))
            <p class="mt-2 text-sm"><strong>Mode de paiement :</strong> {{ $mode_paiement }}</p>
        @endif
    </div>
@endsection
