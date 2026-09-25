import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import ItemCard from "../components/ItemCard";
import { PageHeader, Button, EmptyState, LoadingState, ErrorState } from "../components/ui";

const PAGE_SIZE = 12;

// Public browse/search page for found items. Filtering and pagination are
// done server-side (see backend/controllers/itemController.js listItems) —
// this page fetches only one page at a time rather than the whole collection.
function FoundedItems() {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchItems = useCallback(
    async (pageToLoad, append) => {
      setLoading(true);
      setError("");
      try {
        const params = {
          type: "found",
          status: "active,under_review",
          page: pageToLoad,
          limit: PAGE_SIZE,
        };
        if (search) params.search = search;
        if (locationFilter) params.location = locationFilter;
        if (categoryFilter) params.category = categoryFilter;

        const res = await api.get("/items", { params });
        const sorted = [...res.data.items].sort((a, b) =>
          sortOrder === "newest"
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt)
        );

        setItems((prev) => (append ? [...prev, ...sorted] : sorted));
        setTotalPages(res.data.totalPages);
        setPage(res.data.page);
      } catch (_err) {
        setError("Couldn't load found items right now. Please try again in a moment.");
      } finally {
        setLoading(false);
      }
    },
    [search, locationFilter, categoryFilter, sortOrder]
  );

  useEffect(() => {
    fetchItems(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, locationFilter, categoryFilter, sortOrder]);

  const clearFilters = () => {
    setSearch("");
    setLocationFilter("");
    setCategoryFilter("");
    setSortOrder("newest");
  };

  const hasFilters = search || locationFilter || categoryFilter || sortOrder !== "newest";
  const inputClasses =
    "block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Browse Found Items"
        description="Items below have been brought to and registered by the ASTU Student Union Lost & Found office. If one looks like yours, open it and submit a claim."
      />

      <div className="mb-8 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="sr-only" htmlFor="search-input">
            Search by name
          </label>
          <input
            id="search-input"
            type="text"
            placeholder="Search by name..."
            className={inputClasses}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="location-input">
            Filter by location
          </label>
          <input
            id="location-input"
            type="text"
            placeholder="Location..."
            className={inputClasses}
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="category-select">
            Filter by category
          </label>
          <select
            id="category-select"
            className={inputClasses}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            <option value="ID">ID Card</option>
            <option value="Electronics">Electronics</option>
            <option value="Book">Book</option>
            <option value="Clothing">Clothing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="sr-only" htmlFor="sort-select">
              Sort order
            </label>
            <select
              id="sort-select"
              className={inputClasses}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} className="flex-shrink-0">
              Clear
            </Button>
          )}
        </div>
      </div>

      {error && <ErrorState className="mb-6">{error}</ErrorState>}

      {loading && items.length === 0 ? (
        <LoadingState label="Loading found items..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No matching items found"
          description="Try adjusting your filters, or check back later — new items are added as the Student Union receives them."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {page < totalPages && (
            <div className="mt-8 flex justify-center">
              <Button variant="secondary" onClick={() => fetchItems(page + 1, true)} loading={loading}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FoundedItems;
