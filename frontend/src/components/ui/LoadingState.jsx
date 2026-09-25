// A single, reused loading indicator, so "loading" looks the same
// everywhere instead of a different ad-hoc "Loading..." string per page.
function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-slate-500">
      <svg className="h-6 w-6 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <p className="text-sm">{label}</p>
    </div>
  );
}

export default LoadingState;
