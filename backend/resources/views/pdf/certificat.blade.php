@extends('pdf.layout')

@section('title', 'Certificat Médical')

@section('content')
    <div class="doc-title">Certificat Médical
        @if(!empty($type_label))
            <br><span style="font-size: 11pt; font-weight: normal;">{{ $type_label }}</span>
        @endif
    </div>

    {{-- Patient Info --}}
    <div class="patient-info clearfix">
        <strong>Patient :</strong> {{ $patient['nom_complet'] }}
        @if(!empty($patient['date_naissance']))
            &middot; <strong>Né(e) le :</strong> {{ $patient['date_naissance'] }}
        @endif
        @if(!empty($patient['cin']))
            &middot; <strong>CIN :</strong> {{ $patient['cin'] }}
        @endif
        <br>
        <strong>Date :</strong> {{ $date }}
        @if(!empty($numero))
            &middot; <strong>N° :</strong> {{ $numero }}
        @endif
    </div>

    {{-- Certificate Body --}}
    <div class="content" style="padding: 20px 10px; line-height: 2;">
        <p>Je soussigné, <strong>Dr. {{ $branding['doctor_name'] }}</strong>,
            @if(!empty($branding['specialite']))
                {{ $branding['specialite'] }},
            @endif
            certifie avoir examiné ce jour <strong>{{ $patient['nom_complet'] }}</strong>
            @if(!empty($patient['date_naissance']))
                né(e) le {{ $patient['date_naissance'] }}
            @endif
            et constate que :</p>

        <div style="margin: 20px 0; padding: 15px; border-left: 3px solid #16a34a; background: #f0fdf4;">
            {!! nl2br(e($contenu)) !!}
        </div>

        @if(!empty($duree_repos))
            <p>Un repos de <strong>{{ $duree_repos }} jour(s)</strong> est prescrit
                @if(!empty($date_debut) && !empty($date_fin))
                    du <strong>{{ $date_debut }}</strong> au <strong>{{ $date_fin }}</strong>.
                @endif
            </p>
        @endif

        <p class="mt-2">Ce certificat est délivré à l'intéressé(e) pour servir et valoir ce que de droit.</p>
    </div>

    {{-- Signature --}}
    <div class="signature clearfix">
        <div class="stamp-area">Cachet<br>du médecin</div>
        <div style="float: right;">
            <p>Fait à {{ $branding['ville'] }}, le {{ $date }}</p>
            <div class="signature-line">Dr. {{ $branding['doctor_name'] }}</div>
        </div>
    </div>
@endsection
