import { Link } from "react-router-dom";
import { Package, ArrowUpRight } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function BatchCard({ batch }) {
  const id = batch?._id || batch?.id || batch?.batchId || "PC-DEMO-001";

  return (
    <Link to={`/batches/${id}`} className="batch-card">
      <div className="batch-icon">
        <Package size={21} />
      </div>

      <div className="batch-info">
        <div className="batch-top">
          <strong>{batch?.batchNumber || id}</strong>
          <StatusBadge status={batch?.status || "ACTIVE"} />
        </div>

        <p>{batch?.medicineName || "Medicine batch"}</p>

        <small>
          {batch?.quantity ? `${batch.quantity} units` : "Quantity unavailable"}
        </small>
      </div>

      <ArrowUpRight size={18} className="batch-arrow" />

      <style>{`
        .batch-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 16px;
          border-radius: 18px;
          background: var(--surface);
          box-shadow: var(--soft-shadow);
          transition: .2s ease;
        }

        .batch-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow);
        }

        .batch-icon {
          width: 43px;
          height: 43px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: #e9eee9;
          color: var(--green);
        }

        .batch-info {
          flex: 1;
        }

        .batch-top {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .batch-top strong {
          font-size: 13px;
        }

        .batch-info p {
          margin: 4px 0;
          font-size: 12px;
          color: var(--muted);
        }

        .batch-info small {
          color: var(--muted);
          font-size: 10px;
        }

        .batch-arrow {
          color: var(--muted);
        }
      `}</style>
    </Link>
  );
}
