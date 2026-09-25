// An inline error banner used for both form-submission errors and
// page-level load failures — replaces every bare "form-error" <p> and every
// alert() in the previous CSS-based implementation.
function ErrorState({ children, className = "" }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${className}`}
    >
      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export default ErrorState;
