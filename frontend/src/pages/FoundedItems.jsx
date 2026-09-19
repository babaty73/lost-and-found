import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import ItemCard from "../components/ItemCard";
import "./FoundedItems.css";

const PAGE_SIZE = 12;

// Public browse/search page for found items. Filtering and pagination are
// done server-side (see backend/controllers/itemController.js listItems) —
// this page no longer fetches the entire collection and filters in the
// browser the way the prototype did.
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

  return (
    <div className="founded-container">
      <h1>Browse Found Items</h1>
      <p className="founded-intro">
        Items below have been brought to and registered by the ASTU Student Union
        Lost &amp; Found office. If one looks like yours, open it and submit a claim.
      </p>

      <div className="filters-container">
        <label className="visually-hidden" htmlFor="search-input">
          Search by name
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <label className="visually-hidden" htmlFor="location-input">
          Filter by location
        </label>
        <input
          id="location-input"
          type="text"
          placeholder="Filter by location..."
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />

        <label className="visually-hidden" htmlFor="category-select">
          Filter by category
        </label>
        <select
          id="category-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="ID">ID Card</option>
          <option value="Electronics">Electronics</option>
          <option value="Book">Book</option>
          <option value="Clothing">Clothing</option>
          <option value="Other">Other</option>
        </select>

        <label className="visually-hidden" htmlFor="sort-select">
          Sort order
        </label>
        <select id="sort-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        <button className="clear-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {loading && items.length === 0 ? (
        <div className="empty-state">
          <h3>Loading items...</h3>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>No matching items found</h3>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="items-grid">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {page < totalPages && (
            <div className="load-more-container">
              <button
                className="clear-btn"
                onClick={() => fetchItems(page + 1, true)}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FoundedItems;
