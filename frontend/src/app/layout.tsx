import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TabibCare — Gestion de cabinet médical",
  description: "Plateforme de gestion médicale pour praticiens au Maroc",
};

// Root layout — minimal shell. Locale layout handles html/body.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
