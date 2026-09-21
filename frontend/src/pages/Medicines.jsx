import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, Plus, Search, PackageOpen } from "lucide-react";
import AppShell from "../components/AppShell";
import Loading from "../components/Loading";
import { getMedicines } from "../services/medicineService";

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMedicines()
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.medicines;
        if (items) setMedicines(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = medicines.filter((m) =>
    `${m.name || ""} ${m.manufacturer || ""} ${m.category || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Medicines</h1>
          <p>Manage registered medicines across the supply chain.</p>
        </div>

        <Link className="btn btn-primary" to="/medicines/create">
          <Plus size={16} /> New Medicine
        </Link>
      </div>

      <div className="clay-card medicines-card">
        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicines..."
            />
          </div>

          <div className="medicine-count">
            <Pill size={16} />
            {filtered.length} medicines
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <PackageOpen size={40} />
            <h3>No medicines found</h3>
            <p>Try another search term.</p>
          </div>
        ) : (
          <div className="medicine-grid">
            {filtered.map((medicine, index) => {
              const id = medicine._id || medicine.id || `MED-${index + 1}`;

              return (
                <Link
                  key={id}
                  to={`/medicines/${id}`}
                  className="medicine-card"
                >
                  <div className="medicine-icon">
                    <Pill size={24} />
                  </div>

                  <div>
                    <span className="medicine-id">{id}</span>
                    <h3>{medicine.name || "Unnamed Medicine"}</h3>
                    <p>{medicine.category || "General medicine"}</p>
                  </div>

                  <div className="medicine-meta">
                    <span>Manufacturer</span>
                    <strong>{medicine.manufacturer || "—"}</strong>
                  </div>

                  <div className="medicine-meta">
                    <span>Batches</span>
                    <strong>{medicine.batches ?? "—"}</strong>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .medicines-card {
          padding: 24px;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .search-box {
          width: min(420px, 100%);
        }

        .medicine-count {
          display: flex;
          align-items: center;
          gap: 7px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 700;
        }

        .medicine-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .medicine-card {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 14px;
          padding: 20px;
          border-radius: 20px;
          background: #f7f6f1;
          transition: .2s ease;
        }

        .medicine-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--soft-shadow);
        }

        .medicine-icon {
          width: 52px;
          height: 52px;
          border-radius: 17px;
          display: grid;
          place-items: center;
          background: #e5eee9;
          color: var(--green);
        }

        .medicine-id {
          color: var(--green-2);
          font-size: 10px;
          font-weight: 800;
        }

        .medicine-card h3 {
          margin: 5px 0 3px;
          font-size: 15px;
        }

        .medicine-card p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
        }

        .medicine-meta {
          grid-column: 2;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #e6e5df;
          padding-top: 10px;
          margin-top: -3px;
        }

        .medicine-meta span {
          color: var(--muted);
          font-size: 11px;
        }

        .medicine-meta strong {
          font-size: 11px;
        }

        @media(max-width:750px) {
          .medicine-grid {
            grid-template-columns: 1fr;
          }

          .toolbar {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </AppShell>
  );
}
