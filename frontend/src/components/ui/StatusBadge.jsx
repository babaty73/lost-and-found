// A single source of truth for status colors across the whole app — an
// item or claim in a given status must look identical wherever it's shown
// (dashboard, list, detail page). See the color-system notes: green for
// success/verified, amber for pending/under review, red for
// rejected, blue for active/informational, gray for inactive/neutral.
const STATUS_STYLES = {
  pending_handover: { label: "Pending Handover", classes: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20" },
  active: { label: "Available", classes: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20" },
  under_review: { label: "Under Review", classes: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20" },
  unclaimed: { label: "Unclaimed", classes: "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-400/20" },
  resolved: { label: "Resolved", classes: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/20" },
  cancelled: { label: "Cancelled", classes: "bg-slate-100 text-slate-500 ring-slate-500/20 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-400/20" },

  pending: { label: "Pending", classes: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20" },
  verified: { label: "Verified", classes: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/20" },
  rejected: { label: "Rejected", classes: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20" },
};

function StatusBadge({ status, className = "" }) {
  const style = STATUS_STYLES[status] || { label: status, classes: "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-400/20" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.classes} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {style.label}
    </span>
  );
}

export default StatusBadge;
