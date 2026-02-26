import ItemCard from "../components/ItemCard";

function ReportFound({ foundItems }) {
  return (
    <div>
      <h1>Found Items</h1>

      {foundItems.length === 0 ? (
        <p>No items submitted yet.</p>
      ) : (
        foundItems.map((item, index) => (
          <ItemCard key={index} item={item} />
        ))
      )}
    </div>
  );
}

export default ReportFound;
