import { Link } from "react-router-dom";
import StatusBadge from "./ui/StatusBadge";

// A pure display card — no claim logic lives here. Submitting a claim
// happens on the item's own detail page and is persisted by the backend
// (see ItemDetail.jsx), not held in local component state.
function ItemCard({ item }) {
  const thumbnail = item.images?.[0];
  const eventDate = item.eventDate ? new Date(item.eventDate).toLocaleDateString() : "";

  return (
    <Link
      to={`/items/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition duration-150 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={`Photo of ${item.title}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400" aria-hidden="true">
            No photo
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{item.title}</h3>
        <p className="text-xs text-slate-500">{item.category}</p>
        <p className="text-xs text-slate-500">Found: {item.location}</p>
        <p className="text-xs text-slate-400">{eventDate}</p>
        <div className="mt-auto pt-2">
          <StatusBadge status={item.status} />
        </div>
      </div>
    </Link>
  );
}

export default ItemCard;
