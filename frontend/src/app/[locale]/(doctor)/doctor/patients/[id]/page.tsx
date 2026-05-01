"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft, Pencil, Stethoscope, Camera, ShieldCheck, AlertTriangle,
  Phone, MapPin, CalendarDays, CreditCard, FileText, Pill, Award,
  Plus, Activity, Banknote, FolderOpen, Fingerprint, Shield, Cake,
  Download, BookOpen, ClipboardList, ReceiptText, DollarSign,
  BadgeIcon, Dumbbell,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePatient, useUploadPatientPhoto } from "@/hooks/use-patients";
import { useConsultations } from "@/hooks/use-consultations";
import { usePayments } from "@/hooks/use-payments";
import { usePrescriptions } from "@/hooks/use-prescriptions";
import { useCertificates } from "@/hooks/use-certificates";
import { useReports } from "@/hooks/use-documents";
import { useInvoices } from "@/hooks/use-invoices";

function initials(n: string) {
  return n.split(" ").slice(0, 2).map(x => x[0]).join("").toUpperCase();
}

function SectionCard({
  icon: Icon,
  title,
  headerAction,
  children,
}: {
  icon: React.ElementType;
  title: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
        <h3 className="font-bold flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h3>
        {headerAction}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Empty() {
  return <p className="p-6 text-center text-xs text-muted-foreground">Aucun enregistrement</p>;
}

const PAYMENT_ICONS: Record<string, React.ElementType> = {
  especes: Banknote,
  carte: CreditCard,
  cheque: FileText,
  virement: Activity,
  assurance: Shield,
};

const PAYMENT_LABELS: Record<string, string> = {
  especes: "Espèces", carte: "Carte", cheque: "Chèque",
  virement: "Virement", assurance: "Assurance",
  tpe: "TPE", cheques: "Chèques",
};

const INVOICE_STATUS: Record<string, { label: string; className: string }> = {
  payee:     { label: "Payée",    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  emise:     { label: "Émise",    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  annulee:   { label: "Annulée",  className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" },
  brouillon: { label: "Brouillon",className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
};

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pid = Number(id);
  const photoRef = useRef<HTMLInputElement>(null);

  const { data: patient, isLoading } = usePatient(pid);
  const uploadPhoto = useUploadPatientPhoto(pid);
  const { data: consults }      = useConsultations({ patient_id: pid, per_page: 5 });
  const { data: payments }      = usePayments({ patient_id: pid, per_page: 5 });
  const { data: prescriptions } = usePrescriptions({ patient_id: pid });
  const { data: certs }         = useCertificates({ patient_id: pid });
  const { data: reports }       = useReports({ patient_id: pid, per_page: 4 });
  const { data: invoices }      = useInvoices({ patient_id: pid });

  if (isLoading) return (
    <div className="animate-pulse space-y-5 pb-10">
      <div className="h-44 rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-muted" />)}
      </div>
      <div className="h-28 rounded-2xl bg-muted" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 rounded-2xl bg-muted" />)}
      </div>
    </div>
  );

  if (!patient) return (
    <div className="py-24 text-center text-muted-foreground">Patient introuvable</div>
  );

  const totalPaid = payments?.data?.reduce((s, p) => s + p.montant_paye, 0) ?? 0;
  const totalDue  = payments?.data?.reduce((s, p) => s + p.montant_du, 0)  ?? 0;
  const solde     = totalDue - totalPaid;
  const latestConsult = consults?.data?.[0];

  return (
    <div className="space-y-6 pb-10">

      {/* ── Header Banner ─────────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col lg:flex-row gap-8 items-start">

        {/* Left: photo + identity */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center flex-1 min-w-0">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="h-32 w-32 rounded-2xl overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-md">
              {patient.photo_url
                ? <img src={patient.photo_url} alt={patient.nom_complet} className="h-full w-full object-cover" />
                : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-emerald-500/20 text-3xl font-black text-primary">
                    {initials(patient.nom_complet)}
                  </div>
                )
              }
            </div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto.mutate(f); }} />
            <button
              onClick={() => photoRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.back()}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{patient.nom_complet}</h1>
              {patient.consent_signed_at
                ? <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold">Consentement signé</span>
                : <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-semibold flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Sans consentement</span>
              }
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FolderOpen className="h-4 w-4 shrink-0" />
                Dossier: <span className="font-medium text-foreground">{patient.numero_dossier}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                Tél: <a href={`tel:${patient.telephone}`} className="font-medium text-foreground hover:text-primary">{patient.telephone}</a>
              </div>
              {patient.age != null && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Cake className="h-4 w-4 shrink-0" />
                  Âge: <span className="font-medium text-foreground">{patient.age} ans</span>
                </div>
              )}
              {patient.ville && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  Ville: <span className="font-medium text-foreground">{patient.ville}</span>
                </div>
              )}
              {patient.type_couverture && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 shrink-0" />
                  Couverture: <span className="font-medium text-foreground">{patient.type_couverture}</span>
                </div>
              )}
              {patient.cin && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Fingerprint className="h-4 w-4 shrink-0" />
                  CIN: <span className="font-medium text-foreground">{patient.cin}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
          <Button
            className="flex-1 lg:w-48 h-11 rounded-xl font-bold shadow-lg shadow-primary/20 gap-2"
            onClick={() => router.push(`/doctor/consultations/new?patient_id=${id}`)}
          >
            <Plus className="h-4 w-4" /> Nouv. Consultation
          </Button>
          <Button
            variant="outline"
            className="flex-1 lg:w-48 h-11 rounded-xl font-bold gap-2"
            onClick={() => router.push(`/doctor/patients/${id}/edit`)}
          >
            <Pencil className="h-4 w-4" /> Modifier le profil
          </Button>
        </div>
      </div>

      {/* ── KPI Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Consultations</p>
            <p className="text-2xl font-bold">{patient.consultations_count ?? consults?.data?.length ?? 0}</p>
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Banknote className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Payé</p>
            <p className="text-2xl font-bold">{totalPaid.toLocaleString("fr-MA")} <span className="text-sm font-medium">MAD</span></p>
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${solde > 0 ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600"}`}>
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Solde dû</p>
            <p className={`text-2xl font-bold ${solde > 0 ? "text-red-600" : ""}`}>
              {solde.toLocaleString("fr-MA")} <span className="text-sm font-medium">MAD</span>
            </p>
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dernière Visite</p>
            <p className="text-xl font-bold">
              {patient.derniere_consultation
                ? format(new Date(patient.derniere_consultation), "dd MMM yyyy", { locale: fr })
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Vitals Section ────────────────────────────────────── */}
      {latestConsult && (
        latestConsult.tension_systolique || latestConsult.frequence_cardiaque ||
        latestConsult.poids || latestConsult.temperature || latestConsult.saturation_o2 || latestConsult.imc
      ) && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Derniers paramètres vitaux
            </h2>
            <span className="text-[11px] font-bold text-muted-foreground">
              MAJ: {format(new Date(latestConsult.date_consultation), "dd/MM/yyyy", { locale: fr })}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {latestConsult.tension_systolique != null && (
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Tension</p>
                <p className="text-xl font-black text-blue-900 dark:text-blue-200 mt-0.5">
                  {latestConsult.tension_systolique}/{latestConsult.tension_diastolique}
                  <span className="text-xs font-medium ml-1">mmHg</span>
                </p>
              </div>
            )}
            {latestConsult.frequence_cardiaque != null && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">FC</p>
                <p className="text-xl font-black text-red-900 dark:text-red-200 mt-0.5">
                  {latestConsult.frequence_cardiaque}
                  <span className="text-xs font-medium ml-1">bpm</span>
                </p>
              </div>
            )}
            {latestConsult.poids != null && (
              <div className="bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Poids</p>
                <p className="text-xl font-black text-teal-900 dark:text-teal-200 mt-0.5">
                  {latestConsult.poids}
                  <span className="text-xs font-medium ml-1">kg</span>
                </p>
              </div>
            )}
            {latestConsult.temperature != null && (
              <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Temp</p>
                <p className="text-xl font-black text-orange-900 dark:text-orange-200 mt-0.5">
                  {latestConsult.temperature}
                  <span className="text-xs font-medium ml-1">°C</span>
                </p>
              </div>
            )}
            {latestConsult.saturation_o2 != null && (
              <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">SpO2</p>
                <p className="text-xl font-black text-indigo-900 dark:text-indigo-200 mt-0.5">
                  {latestConsult.saturation_o2}
                  <span className="text-xs font-medium ml-1">%</span>
                </p>
              </div>
            )}
            {latestConsult.imc != null && (
              <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">IMC</p>
                <p className="text-xl font-black text-purple-900 dark:text-purple-200 mt-0.5">
                  {latestConsult.imc}
                  <span className="text-xs font-medium italic ml-1">
                    {latestConsult.imc < 18.5 ? "Maigreur" : latestConsult.imc < 25 ? "Normal" : latestConsult.imc < 30 ? "Surpoids" : "Obésité"}
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Module Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Consultations */}
        <SectionCard
          icon={Stethoscope}
          title="Consultations"
          headerAction={
            <button
              onClick={() => router.push(`/doctor/consultations?patient_id=${id}`)}
              className="text-primary text-xs font-bold hover:underline"
            >Voir tout</button>
          }
        >
          {!consults?.data?.length ? <Empty /> : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {consults.data.map(c => (
                <div key={c.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-primary">
                      {format(new Date(c.date_consultation), "dd MMM yyyy", { locale: fr })}
                    </span>
                    {c.prescriptions_count != null && c.prescriptions_count > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                        {c.prescriptions_count} ord.
                      </span>
                    )}
                  </div>
                  {c.diagnostic && (
                    <p className="text-sm font-bold mb-0.5 truncate">{c.diagnostic}</p>
                  )}
                  {c.examen_clinique && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{c.examen_clinique}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* 2. Règlements */}
        <SectionCard
          icon={ReceiptText}
          title="Règlements"
          headerAction={
            <button
              onClick={() => router.push(`/doctor/payments/new?patient_id=${id}`)}
              className="text-primary text-xs font-bold hover:underline"
            >Nouveau</button>
          }
        >
          {!payments?.data?.length ? <Empty /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-muted-foreground font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Montant</th>
                    <th className="px-4 py-3">Reste</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.data.map(p => {
                    const ModeIcon = PAYMENT_ICONS[p.mode_paiement] ?? Banknote;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {format(new Date(p.date_paiement), "dd/MM/yyyy", { locale: fr })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1">
                            <ModeIcon className="h-3.5 w-3.5" />
                            {PAYMENT_LABELS[p.mode_paiement] ?? p.mode_paiement}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold">{p.montant_paye.toLocaleString("fr-MA")} MAD</td>
                        <td className={`px-4 py-3 font-bold ${p.solde > 0 ? "text-red-500" : "text-emerald-600"}`}>
                          {p.solde.toLocaleString("fr-MA")} MAD
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* 3. Ordonnances */}
        <SectionCard
          icon={Pill}
          title="Ordonnances"
          headerAction={
            <button
              onClick={() => router.push(`/doctor/prescriptions/new?patient_id=${id}`)}
              className="text-primary text-xs font-bold hover:underline"
            >Ajouter</button>
          }
        >
          {!prescriptions?.data?.length ? <Empty /> : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {prescriptions.data.map(p => (
                <div key={p.id} className="p-4">
                  <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
                    {format(new Date(p.date_ordonnance), "dd MMM yyyy", { locale: fr })}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.items?.map((item, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-100 dark:border-emerald-800">
                        {item.medication_name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* 4. Certificats */}
        <SectionCard
          icon={Award}
          title="Certificats"
          headerAction={
            <button
              onClick={() => router.push(`/doctor/certificates/new?patient_id=${id}`)}
              className="text-primary text-xs font-bold hover:underline"
            >Ajouter</button>
          }
        >
          {!certs?.data?.length ? <Empty /> : (
            <div className="p-2">
              {certs.data.map(c => {
                const isAptitude = c.type === "aptitude";
                return (
                  <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 group">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isAptitude ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"}`}>
                      {isAptitude ? <Dumbbell className="h-5 w-5" /> : <BadgeIcon className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {c.type === "repos" ? "Certificat de repos (Maladie)" : c.type === "aptitude" ? "Aptitude Sportive" : c.type}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(c.date_certificat), "dd MMM yyyy", { locale: fr })}
                        {c.nombre_jours && <span className={`ml-1 font-bold ${isAptitude ? "text-amber-600" : "text-blue-600"}`}>• {c.nombre_jours} Jours</span>}
                      </p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* 5. Rapports médicaux */}
        <SectionCard
          icon={FileText}
          title="Rapports médicaux"
          headerAction={
            <button className="text-primary text-xs font-bold hover:underline">Générer</button>
          }
        >
          {!reports?.data?.length ? <Empty /> : (
            <div className="p-2">
              {reports.data.map(r => (
                <div key={r.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{r.titre}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {format(new Date(r.date_rapport), "dd MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <button className="text-primary text-xs font-bold hover:underline shrink-0">Ouvrir</button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* 6. Factures */}
        <SectionCard
          icon={DollarSign}
          title="Factures"
          headerAction={
            <button
              onClick={() => router.push(`/doctor/invoices/new?patient_id=${id}`)}
              className="text-primary text-xs font-bold hover:underline"
            >Nouvelle</button>
          }
        >
          {!invoices?.data?.length ? <Empty /> : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.data.map(inv => {
                const status = INVOICE_STATUS[inv.statut] ?? { label: inv.statut, className: "bg-muted text-muted-foreground" };
                return (
                  <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{inv.numero}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {format(new Date(inv.date_facture), "dd/MM/yyyy", { locale: fr })} • Total:{" "}
                        <span className="font-bold">{inv.total_ttc.toLocaleString("fr-MA")} MAD</span>
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
