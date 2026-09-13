import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pill,
  ShieldCheck,
  Package,
  MapPin,
  CalendarDays,
  ArrowRight
} from "lucide-react";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";

export default function MedicinePassport() {
  const { id } = useParams();

  const medicine = {
    id: id || "MED-001",
    name: "Paracetamol 500mg",
    generic: "Paracetamol",
    category: "Analgesic",
    manufacturer: "PharmaCare",
    description:
      "Medicine identity record and supply-chain overview.",
    batches: 12
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <button
            className="back-link"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <h1>Medicine Passport</h1>
          <p>Digital identity for {medicine.name}.</p>
        </div>
      </div>

      <div className="passport-layout">
        <section className="clay-card passport-hero">
          <div className="passport-pill">
            <Pill size={34} />
          </div>

          <span className="passport-label">MEDICINE IDENTITY</span>
          <h2>{medicine.name}</h2>
          <p>{medicine.description}</p>

          <div className="passport-id">{medicine.id}</div>

          <div className="passport-details">
            <div>
              <span>Generic name</span>
              <strong>{medicine.generic}</strong>
            </div>

            <div>
              <span>Category</span>
              <strong>{medicine.category}</strong>
            </div>

            <div>
              <span>Manufacturer</span>
              <strong>{medicine.manufacturer}</strong>
            </div>

            <div>
              <span>Total batches</span>
              <strong>{medicine.batches}</strong>
            </div>
          </div>
        </section>

        <section className="clay-card passport-trust">
          <div className="trust-header">
            <ShieldCheck size={22} />
            <div>
              <h2>Trust record</h2>
              <p>Connected verification layers</p>
            </div>
          </div>

          <div className="trust-row">
            <div className="trust-icon">
              <Package size={18} />
            </div>
            <div>
              <strong>Registered batches</strong>
              <span>12 traceable batch records</span>
            </div>
            <StatusBadge status="ACTIVE" />
          </div>

          <div className="trust-row">
            <div className="trust-icon">
              <MapPin size={18} />
            </div>
            <div>
              <strong>Supply-chain tracking</strong>
              <span>Custody history supported</span>
            </div>
            <StatusBadge status="ACTIVE" />
          </div>

          <div className="trust-row">
            <div className="trust-icon">
              <CalendarDays size={18} />
            </div>
            <div>
              <strong>Blockchain proof</strong>
              <span>Integration pending</span>
            </div>
            <span className="status status-neutral">PENDING</span>
          </div>

          <Link to="/verify" className="btn btn-primary passport-button">
            Verify a Batch <ArrowRight size={15} />
          </Link>
        </section>
      </div>

      <style>{`
        .back-link {
          border: 0;
          background: transparent;
          color: var(--muted);
          display: flex;
          gap: 6px;
          align-items: center;
          padding: 0;
          margin-bottom: 12px;
          font-size: 12px;
        }

        .passport-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }

        .passport-hero,
        .passport-trust {
          padding: 30px;
        }

        .passport-pill {
          width: 70px;
          height: 70px;
          border-radius: 22px;
          display: grid;
          place-items: center;
          color: var(--green);
          background: #e5eee9;
          margin-bottom: 23px;
        }

        .passport-label {
          color: var(--green-2);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .passport-hero h2 {
          font-size: 27px;
          margin: 8px 0;
        }

        .passport-hero > p {
          color: var(--muted);
          line-height: 1.7;
          font-size: 12px;
        }

        .passport-id {
          display: inline-block;
          padding: 8px 11px;
          border-radius: 10px;
          background: #f0efe9;
          color: var(--muted);
          font-size: 10px;
          margin-top: 8px;
        }

        .passport-details {
          margin-top: 27px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .passport-details div {
          padding: 13px;
          border-radius: 14px;
          background: #f2f2ed;
        }

        .passport-details span,
        .passport-details strong {
          display: block;
        }

        .passport-details span {
          color: var(--muted);
          font-size: 9px;
          margin-bottom: 5px;
        }

        .passport-details strong {
          font-size: 11px;
        }

        .trust-header {
          display: flex;
          gap: 10px;
          align-items: center;
          color: var(--green);
          margin-bottom: 25px;
        }

        .trust-header h2 {
          color: var(--ink);
          margin: 0;
          font-size: 17px;
        }

        .trust-header p {
          color: var(--muted);
          margin: 3px 0 0;
          font-size: 10px;
        }

        .trust-row {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 14px;
          border-radius: 15px;
          background: #f2f2ed;
          margin-bottom: 10px;
        }

        .trust-icon {
          width: 37px;
          height: 37px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          color: var(--green);
          background: #e5eee9;
        }

        .trust-row > div:nth-child(2) {
          flex: 1;
        }

        .trust-row strong,
        .trust-row span {
          display: block;
        }

        .trust-row strong {
          font-size: 11px;
        }

        .trust-row span:not(.status) {
          color: var(--muted);
          font-size: 9px;
          margin-top: 3px;
        }

        .passport-button {
          margin-top: 13px;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        @media(max-width:800px) {
          .passport-layout {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width:500px) {
          .passport-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppShell>
  );
}
