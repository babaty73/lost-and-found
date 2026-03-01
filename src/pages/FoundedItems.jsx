import { useState } from "react";
import ItemCard from "../components/ItemCard";
import "./FoundedItems.css";

function FoundedItems({ foundItems, setFoundItems }) {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Update item by object reference
  const updateItemStatus = (originalItem, updatedItem) => {
    const newItems = foundItems.map((item) =>
      item === originalItem ? updatedItem : item
    );
    setFoundItems(newItems);
  };

  const clearFilters = () => {
    setSearch("");
    setLocationFilter("");
    setDateFilter("");
    setCategoryFilter("");
    setSortOrder("newest");
  };

  const filteredItems = foundItems
    .filter((item) => {
      const matchesName = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesLocation = locationFilter ? item.location.toLowerCase().includes(locationFilter.toLowerCase()) : true;
      const matchesDate = dateFilter ? item.date === dateFilter : true;
      const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
      return matchesName && matchesLocation && matchesDate && matchesCategory;
    })
    .sort((a, b) => (sortOrder === "newest" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)));

  return (
    <div className="founded-container">
      <h1>Founded Items</h1>

      {/* Filters */}
      <div className="filters-container">
        <input type="text" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <input type="text" placeholder="Filter by location..." value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} />
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          <option value="ID">ID Card</option>
          <option value="Electronics">Electronics</option>
          <option value="Book">Book</option>
          <option value="Clothing">Clothing</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <button className="clear-btn" onClick={clearFilters}>Clear Filters</button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <h3>No matching items found</h3>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id || item.name + item.date} // unique key
              item={item}
              updateItemStatus={updateItemStatus} // pass function
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FoundedItems;
