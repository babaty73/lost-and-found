function Card({ as: Comp = "div", className = "", hoverable = false, ...props }) {
  return (
    <Comp
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-card
        ${hoverable ? "transition duration-150 hover:-translate-y-0.5 hover:shadow-card-hover" : ""}
        ${className}`}
      {...props}
    />
  );
}

export default Card;
