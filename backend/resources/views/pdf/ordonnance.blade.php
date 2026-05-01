@extends('pdf.layout')

@section('title', 'Ordonnance Médicale')

@section('content')
    <div class="doc-title">Ordonnance Médicale</div>

    {{-- Patient Info --}}
    <div class="patient-info clearfix">
        <strong>Patient :</strong> {{ $patient['nom_complet'] }}
        @if(!empty($patient['date_naissance']))
            &middot; <strong>Né(e) le :</strong> {{ $patient['date_naissance'] }}
        @endif
        @if(!empty($patient['numero_dossier']))
            &middot; <strong>Dossier :</strong> {{ $patient['numero_dossier'] }}
        @endif
        <br>
        <strong>Date :</strong> {{ $date }}
        @if(!empty($numero))
            &middot; <strong>N° :</strong> {{ $numero }}
        @endif
    </div>

    {{-- Medications --}}
    <div class="content">
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 35%;">Médicament</th>
                    <th style="width: 25%;">Posologie</th>
                    <th style="width: 20%;">Durée</th>
                    <th style="width: 15%;">Quantité</th>
                </tr>
            </thead>
            <tbody>
                @foreach($medications as $i => $med)
                <tr>
                    <td class="text-center">{{ $i + 1 }}</td>
                    <td><strong>{{ $med['nom'] }}</strong>
                        @if(!empty($med['forme']))
                            <br><span class="text-sm text-muted">{{ $med['forme'] }} {{ $med['dosage'] ?? '' }}</span>
                        @endif
                    </td>
                    <td>{{ $med['posologie'] ?? '-' }}</td>
                    <td>{{ $med['duree'] ?? '-' }}</td>
                    <td class="text-center">{{ $med['quantite'] ?? '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        @if(!empty($notes))
            <div class="mt-2">
                <strong>Notes :</strong><br>
                <span class="text-sm">{{ $notes }}</span>
            </div>
        @endif
    </div>

    {{-- Signature --}}
    <div class="signature clearfix">
        <div class="stamp-area">Cachet<br>du médecin</div>
        <div style="float: right;">
            <div class="signature-line">Dr. {{ $branding['doctor_name'] }}</div>
        </div>
    </div>
@endsection
