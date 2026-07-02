export type LeadStatus = "new" | "contacted" | "converted";
export type LeadSource = "website" | "social_media" | "referral" | "other";

export const statusBadge = (status: string) => {
  switch (status) {
    case "new":
      return { label: "New", className: "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 border-0" };
    case "contacted":
      return { label: "Contacted", className: "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-300 border-0" };
    case "converted":
      return { label: "Converted", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300 border-0" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground border-0" };
  }
};

export const sourceLabel = (s: string) =>
  ({ website: "Website", social_media: "Social Media", referral: "Referral", other: "Other" } as Record<string, string>)[s] ?? s;

export const STATUSES: LeadStatus[] = ["new", "contacted", "converted"];
export const SOURCES: LeadSource[] = ["website", "social_media", "referral", "other"];
