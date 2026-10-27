function Card({ as: Comp = "div", className = "", hoverable = false, ...props }) {
  return (
    <Comp
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
        ${hoverable ? "transition duration-150 hover:-translate-y-0.5 hover:shadow-card-hover" : ""}
        ${className}`}
      {...props}
    />
  );
}

export default Card;
