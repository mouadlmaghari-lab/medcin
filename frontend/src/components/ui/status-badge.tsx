import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
  {
    variants: {
      variant: {
        confirmed:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
        pending:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
        cancelled:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
        completed:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        noshow:
          "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
        default:
          "bg-muted text-muted-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const dotVariants: Record<string, string> = {
  confirmed: "bg-emerald-500",
  pending: "bg-amber-500",
  cancelled: "bg-red-500",
  completed: "bg-blue-500",
  noshow: "bg-slate-400",
  default: "bg-muted-foreground",
};

type StatusVariant = "confirmed" | "pending" | "cancelled" | "completed" | "noshow" | "default";

interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
  label: string;
  variant?: StatusVariant;
  className?: string;
}

export function StatusBadge({ label, variant = "default", className }: StatusBadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      <span
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotVariants[variant ?? "default"])}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
