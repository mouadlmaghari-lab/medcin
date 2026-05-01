export default function AssistantDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Espace Aide-Médecin
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Rendez-vous aujourd'hui", value: "—" },
          { label: "Total patients", value: "—" },
          { label: "Règlements du jour", value: "— MAD" },
          { label: "Dépenses du mois", value: "— MAD" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
