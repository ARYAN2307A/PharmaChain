export default function StatusBadge({ status }) {
  const value = String(status || "UNKNOWN").toUpperCase();

  const classMap = {
    ACTIVE: "status-active",
    CREATED: "status-neutral",
    IN_TRANSIT: "status-transit",
    DISPATCHED: "status-transit",
    RECEIVED: "status-active",
    AT_PHARMACY: "status-active",
    SOLD: "status-neutral",
    RECALLED: "status-recalled",
    SUSPENDED: "status-suspended",
    EXPIRED: "status-recalled",
    PENDING: "status-neutral",
    COMPLETED: "status-active",
    CANCELLED: "status-recalled",
    MANUFACTURER: "status-active",
    DISTRIBUTOR: "status-transit",
    WAREHOUSE: "status-neutral",
    PHARMACY: "status-active",
  };

  return (
    <span className={`status ${classMap[value] || "status-neutral"}`}>
      <span>●</span>
      {value.replaceAll("_", " ")}
    </span>
  );
}
