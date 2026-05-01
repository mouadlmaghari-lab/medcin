import { redirect } from "next/navigation";

// Root locale page — redirect to login
// (authenticated users are redirected to /doctor or /assistant in middleware)
export default function LocaleRootPage() {
  redirect("/login");
}
