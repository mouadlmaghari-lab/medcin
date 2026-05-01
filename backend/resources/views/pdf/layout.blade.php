<!DOCTYPE html>
<html lang="{{ $lang ?? 'fr' }}" dir="{{ $dir ?? 'ltr' }}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>@yield('title', 'Document Médical')</title>
    <style>
        /* ── Reset & Base ────────────────────────────────────── */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: {!! $font_family ?? "'DejaVu Sans', sans-serif" !!};
            font-size: 11pt;
            color: #1a1a1a;
            line-height: 1.5;
            padding: 15mm 15mm 20mm 15mm;
        }

        /* ── RTL Support ─────────────────────────────────────── */
        [dir="rtl"] body {
            direction: rtl;
            text-align: right;
            font-family: 'Amiri', 'Cairo', 'DejaVu Sans', serif;
        }
        [dir="rtl"] .header-left { float: right; }
        [dir="rtl"] .header-right { float: left; text-align: left; }
        [dir="rtl"] .signature { text-align: left; }
        [dir="rtl"] .stamp-area { float: right; }

        /* ── Header (Cabinet Branding) ───────────────────────── */
        .header {
            border-bottom: 2px solid #16a34a;
            padding-bottom: 10px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        .header-left { float: left; max-width: 60%; }
        .header-right { float: right; text-align: right; max-width: 38%; }
        .cabinet-name {
            font-size: 16pt;
            font-weight: bold;
            color: #16a34a;
            margin-bottom: 2px;
        }
        .doctor-name { font-size: 13pt; font-weight: bold; color: #333; }
        .doctor-specialite { font-size: 10pt; color: #666; margin-bottom: 4px; }
        .header-info { font-size: 8pt; color: #888; line-height: 1.4; }
        .header-logo { max-height: 60px; max-width: 120px; }

        /* ── Document Title ──────────────────────────────────── */
        .doc-title {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #16a34a;
            margin: 15px 0;
            padding: 8px;
            border: 1px solid #16a34a;
        }

        /* ── Patient Info Box ────────────────────────────────── */
        .patient-info {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 10px 14px;
            margin-bottom: 15px;
            font-size: 10pt;
        }
        .patient-info strong { color: #334155; }

        /* ── Content Area ────────────────────────────────────── */
        .content { min-height: 350px; margin: 15px 0; }

        /* ── Table Styles ────────────────────────────────────── */
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th { background: #f1f5f9; color: #334155; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.5px; }
        th, td { padding: 8px 10px; border: 1px solid #e2e8f0; text-align: left; font-size: 10pt; }
        [dir="rtl"] th, [dir="rtl"] td { text-align: right; }
        tr:nth-child(even) { background: #f8fafc; }

        /* ── Footer ──────────────────────────────────────────── */
        .footer {
            position: fixed;
            bottom: 10mm;
            left: 15mm;
            right: 15mm;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            font-size: 7pt;
            color: #94a3b8;
            text-align: center;
        }
        .footer .inpe { font-weight: bold; color: #64748b; }

        /* ── Signature Area ──────────────────────────────────── */
        .signature {
            margin-top: 40px;
            text-align: right;
            font-size: 10pt;
        }
        .signature-line {
            margin-top: 40px;
            border-top: 1px solid #333;
            display: inline-block;
            width: 200px;
            text-align: center;
            padding-top: 4px;
            font-size: 9pt;
            color: #666;
        }

        /* ── Stamp Area ──────────────────────────────────────── */
        .stamp-area {
            border: 1px dashed #cbd5e1;
            width: 120px;
            height: 120px;
            float: left;
            margin-top: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
            font-size: 8pt;
            text-align: center;
            padding: 8px;
        }

        /* ── Utility ─────────────────────────────────────────── */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-sm { font-size: 9pt; }
        .text-muted { color: #94a3b8; }
        .mt-2 { margin-top: 10px; }
        .mb-2 { margin-bottom: 10px; }
        .clearfix::after { content: ""; display: table; clear: both; }

        @yield('styles')
    </style>
</head>
<body>
    {{-- ── Header ──────────────────────────────────────────────── --}}
    <div class="header clearfix">
        <div class="header-left">
            <div class="cabinet-name">{{ $branding['cabinet_name'] }}</div>
            <div class="doctor-name">Dr. {{ $branding['doctor_name'] }}</div>
            <div class="doctor-specialite">{{ $branding['specialite'] }}</div>
        </div>
        <div class="header-right">
            @if($branding['logo_url'])
                <img src="{{ $branding['logo_url'] }}" class="header-logo" alt="Logo">
            @endif
            <div class="header-info">
                @if($branding['adresse'])<div>{{ $branding['adresse'] }}</div>@endif
                @if($branding['ville'])<div>{{ $branding['ville'] }}</div>@endif
                @if($branding['telephone'])<div>Tél: {{ $branding['telephone'] }}</div>@endif
                @if($branding['email'])<div>{{ $branding['email'] }}</div>@endif
            </div>
        </div>
    </div>

    {{-- ── Body Content ────────────────────────────────────────── --}}
    @yield('content')

    {{-- ── Footer ──────────────────────────────────────────────── --}}
    <div class="footer">
        @if($branding['inpe'])
            <span class="inpe">INPE: {{ $branding['inpe'] }}</span> &middot;
        @endif
        {{ $branding['cabinet_name'] }} &middot; {{ $branding['adresse'] }}, {{ $branding['ville'] }}
        &middot; Généré le {{ $generated_at }}
    </div>
</body>
</html>
