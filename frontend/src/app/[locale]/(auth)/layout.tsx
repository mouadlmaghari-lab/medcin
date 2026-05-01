import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TabibCare — Connexion",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between bg-[oklch(0.18_0.055_150)] p-10 text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-white"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">TabibCare</span>
        </div>

        <div className="space-y-4">
          <blockquote className="text-xl font-medium leading-relaxed text-white/90">
            &ldquo;La médecine est l&apos;art d&apos;observer les maladies de la
            nature et de les traiter par l&apos;art.&rdquo;
          </blockquote>
          <p className="text-sm text-white/50">
            Plateforme de gestion médicale pour praticiens au Maroc
          </p>
        </div>

        <div className="space-y-1 text-xs text-white/40">
          <p>Conforme Loi 09-08 et Loi 05-20</p>
          <p>© {new Date().getFullYear()} TabibCare. Tous droits réservés.</p>
        </div>
      </div>

      {/* Right — form area */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
