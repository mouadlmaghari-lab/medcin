@extends('pdf.layout')

@section('title', 'Compte Rendu de Consultation')

@section('content')
    {{-- ── Title ──────────────────────────────────────────── --}}
    <div class="doc-title">Compte Rendu de Consultation</div>

    {{-- ── Patient Info ───────────────────────────────────── --}}
    <div class="patient-info clearfix">
        <strong>Patient :</strong> {{ $patient->nom_complet ?? '—' }}
        &nbsp;&middot;&nbsp;
        <strong>N° Dossier :</strong> {{ $patient->numero_dossier ?? '—' }}
        @if($patient->date_naissance)
            &nbsp;&middot;&nbsp;
            <strong>Né(e) le :</strong> {{ \Carbon\Carbon::parse($patient->date_naissance)->format('d/m/Y') }}
        @endif
        @if($patient->sexe)
            &nbsp;&middot;&nbsp;
            <strong>Sexe :</strong> {{ $patient->sexe === 'M' ? 'Masculin' : 'Féminin' }}
        @endif
        @if($patient->groupe_sanguin)
            &nbsp;&middot;&nbsp;
            <strong>GS :</strong> {{ $patient->groupe_sanguin }}
        @endif
    </div>

    {{-- ── Consultation Details ───────────────────────────── --}}
    <div class="content">
        <table>
            <tr>
                <td style="width: 30%; font-weight: bold; background: #f1f5f9;">Date</td>
                <td>{{ \Carbon\Carbon::parse($consultation->date_consultation)->format('d/m/Y à H:i') }}</td>
            </tr>
            @if($consultation->motif)
            <tr>
                <td style="font-weight: bold; background: #f1f5f9;">Motif</td>
                <td>{{ $consultation->motif }}</td>
            </tr>
            @endif
            @if($consultation->examen_clinique)
            <tr>
                <td style="font-weight: bold; background: #f1f5f9;">Examen clinique</td>
                <td>{!! nl2br(e($consultation->examen_clinique)) !!}</td>
            </tr>
            @endif
            @if($consultation->diagnostic)
            <tr>
                <td style="font-weight: bold; background: #f1f5f9;">Diagnostic</td>
                <td>{{ $consultation->diagnostic }}</td>
            </tr>
            @endif
            @if($consultation->notes)
            <tr>
                <td style="font-weight: bold; background: #f1f5f9;">Notes</td>
                <td>{!! nl2br(e($consultation->notes)) !!}</td>
            </tr>
            @endif
        </table>

        {{-- ── Vital Signs (if present) ──────────────────────── --}}
        @if($consultation->tension_arterielle || $consultation->temperature || $consultation->poids || $consultation->taille)
        <h3 style="margin-top: 15px; color: #16a34a; font-size: 12pt;">Constantes vitales</h3>
        <table>
            @if($consultation->tension_arterielle)
            <tr><td style="width: 30%; background: #f1f5f9; font-weight: bold;">Tension artérielle</td><td>{{ $consultation->tension_arterielle }} mmHg</td></tr>
            @endif
            @if($consultation->temperature)
            <tr><td style="background: #f1f5f9; font-weight: bold;">Température</td><td>{{ $consultation->temperature }} °C</td></tr>
            @endif
            @if($consultation->poids)
            <tr><td style="background: #f1f5f9; font-weight: bold;">Poids</td><td>{{ $consultation->poids }} kg</td></tr>
            @endif
            @if($consultation->taille)
            <tr><td style="background: #f1f5f9; font-weight: bold;">Taille</td><td>{{ $consultation->taille }} cm</td></tr>
            @endif
        </table>
        @endif

        {{-- ── Prescriptions (if loaded) ─────────────────────── --}}
        @if($consultation->prescriptions && $consultation->prescriptions->count() > 0)
        <h3 style="margin-top: 15px; color: #16a34a; font-size: 12pt;">Ordonnance(s)</h3>
        @foreach($consultation->prescriptions as $prescription)
            @if($prescription->medications && $prescription->medications->count() > 0)
            <table>
                <thead>
                    <tr>
                        <th>Médicament</th>
                        <th>Dosage</th>
                        <th>Posologie</th>
                        <th>Durée</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($prescription->medications as $med)
                    <tr>
                        <td>{{ $med->nom ?? $med->pivot->nom ?? '—' }}</td>
                        <td>{{ $med->dosage ?? $med->pivot->dosage ?? '—' }}</td>
                        <td>{{ $med->posologie ?? $med->pivot->posologie ?? '—' }}</td>
                        <td>{{ $med->duree ?? $med->pivot->duree ?? '—' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @endif
        @endforeach
        @endif

        {{-- ── Certificates (if loaded) ──────────────────────── --}}
        @if($consultation->certificates && $consultation->certificates->count() > 0)
        <h3 style="margin-top: 15px; color: #16a34a; font-size: 12pt;">Certificat(s) médical(aux)</h3>
        @foreach($consultation->certificates as $cert)
            <div style="border-left: 3px solid #16a34a; padding: 8px 12px; margin: 8px 0; background: #f0fdf4;">
                <strong>{{ $cert->type ?? 'Certificat médical' }}</strong>
                @if($cert->duree_repos)
                — Repos: {{ $cert->duree_repos }} jour(s)
                @endif
            </div>
        @endforeach
        @endif
    </div>

    {{-- ── Signature ──────────────────────────────────────── --}}
    <div class="clearfix">
        <div class="stamp-area">Cachet</div>
        <div class="signature">
            <div>Fait à {{ $branding['ville'] }}, le {{ $generated_at }}</div>
            <div class="signature-line">Dr. {{ $branding['doctor_name'] }}</div>
        </div>
    </div>
@endsection
