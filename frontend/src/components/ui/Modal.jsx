import { useEffect } from "react";
import Button from "./Button";

// A small, accessible confirmation dialog — used in place of the browser's
// native confirm() for destructive/important admin actions (e.g. accepting
// a handover, rejecting a claim), per the redesign brief.
function Modal({ open, title, description, confirmLabel = "Confirm", variant = "primary", onConfirm, onClose, loading }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-md animate-scale-in rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
