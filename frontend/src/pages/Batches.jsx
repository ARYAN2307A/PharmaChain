import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  ArrowUpRight
} from "lucide-react";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import { getBatches } from "../services/batchService";

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBatches()
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.batches;
        if (items) setBatches(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = batches.filter((batch) =>
    `${batch.batchNumber || ""} ${batch.medicine?.name || ""} ${batch.status || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Medicine Batches</h1>
          <p>Track batches and their current supply-chain state.</p>
        </div>

        <Link className="btn btn-primary" to="/batches/create">
          <Plus size={16} /> Create Batch
        </Link>
      </div>

      <div className="clay-card batches-panel">
        <div className="batch-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              className="input"
              placeholder="Search batch ID or medicine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="batch-total">
            <Package size={16} />
            {filtered.length} batches
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Medicine</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Expiry</th>
                  <th>Current Owner</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((batch, index) => {
                  const id =
                    batch._id ||
                    batch.id ||
                    batch.batchId ||
                    `PC-DEMO-${index}`;

                  return (
                    <tr key={id}>
                      <td>
                        <strong>{batch.batchNumber || id}</strong>
                      </td>
                      <td>{batch.medicine?.name || "—"}</td>
                      <td>{batch.quantity ?? "—"}</td>
                      <td>
                        <StatusBadge status={batch.status} />
                      </td>
                      <td>{batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : "—"}</td>
                      <td>{batch.currentOwner?.name || batch.owner || "—"}</td>
                      <td>
                        <Link to={`/batches/${id}`}>
                          <ArrowUpRight size={17} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .batches-panel {
          padding: 24px;
        }

        .batch-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .batch-total {
          display: flex;
          align-items: center;
          gap: 7px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 700;
        }

        .search-box {
          width: min(430px, 100%);
        }

        @media(max-width:700px) {
          .batch-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </AppShell>
  );
}
