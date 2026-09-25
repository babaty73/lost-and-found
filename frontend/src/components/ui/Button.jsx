const VARIANTS = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 disabled:bg-primary-300",
  secondary:
    "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:ring-primary-500 disabled:text-slate-400 disabled:bg-slate-50",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-300",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-primary-500 disabled:text-slate-300",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

/**
 * The single button component used everywhere in the app. Four variants
 * cover every case the redesign calls for: primary (main actions),
 * secondary (supporting actions), destructive (reject/delete/cancel), and
 * ghost (low-emphasis actions like "clear filters").
 */
function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  children,
  as: Comp = "button",
  ...props
}) {
  return (
    <Comp
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold
        transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-offset-2 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin text-current"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </Comp>
  );
}

export default Button;
