// Shared field chrome (label, helper text, error text) so every input,
// textarea, and select in the app looks and behaves identically. Inputs
// always get a real <label htmlFor>, never a placeholder standing in alone.
const baseControlClasses =
  "block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm " +
  "transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 " +
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-400";

function fieldBorder(error) {
  return error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-primary-500 dark:border-slate-600 dark:focus:border-primary-400";
}

function FieldShell({ id, label, hint, error, required, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ id, label, hint, error, required, className = "", ...props }) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <input
        id={id}
        className={`${baseControlClasses} ${fieldBorder(error)} ${className}`}
        required={required}
        {...props}
      />
    </FieldShell>
  );
}

export function Textarea({ id, label, hint, error, required, className = "", rows = 3, ...props }) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        rows={rows}
        className={`${baseControlClasses} ${fieldBorder(error)} resize-y ${className}`}
        required={required}
        {...props}
      />
    </FieldShell>
  );
}

export function Select({ id, label, hint, error, required, className = "", children, ...props }) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <select
        id={id}
        className={`${baseControlClasses} ${fieldBorder(error)} ${className}`}
        required={required}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export default FieldShell;
