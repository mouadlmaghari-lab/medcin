@extends('pdf.layout')

@section('title', 'Rapport Médical')

@section('content')
    <div class="doc-title">Rapport Médical</div>

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
        @if(!empty($titre))
            &middot; <strong>Objet :</strong> {{ $titre }}
        @endif
    </div>

    <div class="content" style="line-height: 1.8;">
        {!! nl2br(e($contenu)) !!}
    </div>

    <div class="signature clearfix">
        <div class="stamp-area">Cachet<br>du médecin</div>
        <div style="float: right;">
            <p>Fait à {{ $branding['ville'] }}, le {{ $date }}</p>
            <div class="signature-line">Dr. {{ $branding['doctor_name'] }}</div>
        </div>
    </div>
@endsection
