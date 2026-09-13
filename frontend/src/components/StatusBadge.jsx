export default function StatusBadge({ status }) {
  const value = String(status || "UNKNOWN").toUpperCase();

  const classMap = {
    ACTIVE: "status-active",
    IN_TRANSIT: "status-transit",
    DISPATCHED: "status-transit",
    RECALLED: "status-recalled",
    SUSPENDED: "status-suspended"
  };

  return (
    <span className={`status ${classMap[value] || "status-neutral"}`}>
      <span>●</span>
      {value.replaceAll("_", " ")}
    </span>
  );
}
