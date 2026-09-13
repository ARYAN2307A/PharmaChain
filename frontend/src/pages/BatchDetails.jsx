import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ShieldCheck,
  Clock3,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import { verifyBatch, recallBatch, restoreBatch } from "../services/batchService";

export default function BatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [batch, setBatch] = useState({
    batchNumber: id,
    medicineName: "Paracetamol 500mg",
    quantity: 5000,
    status: "ACTIVE",
    owner: "PharmaCare",
    manufactureDate: "2026-04-18",
    expiryDate: "2027-04-18",
    storageConditions: "15–25°C",
    blockchainStatus: "Integration pending"
  });

  const [verification, setVerification] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    verifyBatch(id)
      .then((data) => setVerification(data))
      .catch(() => {});
  }, [id]);

  const action = async (type) => {
    setMessage("");

    try {
      if (type === "recall") {
        await recallBatch(id);
        setBatch((b) => ({ ...b, status: "RECALLED" }));
      }

      if (type === "restore") {
        await restoreBatch(id);
        setBatch((b) => ({ ...b, status: "ACTIVE" }));
      }
    } catch {
      setMessage("Backend action unavailable right now.");
    }
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back
          </button>
          <h1>{batch.batchNumber}</h1>
          <p>{batch.medicineName}</p>
        </div>

        <StatusBadge status={batch.status} />
      </div>

      <div className="detail-grid">
        <section className="clay-card overview-card">
          <div className="detail-icon">
            <Package size={27} />
          </div>

          <h2>{batch.medicineName}</h2>
          <p className="muted">Traceable medicine batch</p>

          <div className="detail-stats">
            <div>
              <span>Quantity</span>
              <strong>{batch.quantity}</strong>
            </div>
            <div>
              <span>Current owner</span>
              <strong>{batch.owner}</strong>
            </div>
            <div>
              <span>Manufactured</span>
              <strong>{batch.manufactureDate}</strong>
            </div>
            <div>
              <span>Expires</span>
              <strong>{batch.expiryDate}</strong>
            </div>
          </div>
        </section>

        <section className="clay-card verification-card">
          <div className="section-title">
            <ShieldCheck size={20} />
            <div>
              <h2>Blockchain Verification</h2>
              <p>On-chain proof status</p>
            </div>
          </div>

          <div className="verification-status">
            <div className="proof-circle">
              <ShieldCheck size={30} />
            </div>

            <div>
              <strong>
                {verification ? "Verification response received" : "Integration pending"}
              </strong>
              <p>
                {verification
                  ? "Backend verification data is available."
                  : "Blockchain verification will appear here after integration."}
              </p>
            </div>
          </div>
        </section>

        <section className="clay-card information-card">
          <div className="section-title">
            <Clock3 size={20} />
            <div>
              <h2>Batch Information</h2>
              <p>Current recorded details</p>
            </div>
          </div>

          <div className="info-list">
            <div>
              <span>Storage conditions</span>
              <strong>{batch.storageConditions}</strong>
            </div>
            <div>
              <span>Lifecycle</span>
              <strong>CREATED</strong>
            </div>
            <div>
              <span>Current status</span>
              <StatusBadge status={batch.status} />
            </div>
          </div>
        </section>

        <section className="clay-card actions-card">
          <div className="section-title">
            <AlertTriangle size={20} />
            <div>
              <h2>Safety Actions</h2>
              <p>Manage exceptional batch states.</p>
            </div>
          </div>

          <div className="action-row">
            <button
              className="btn btn-danger"
              onClick={() => action("recall")}
            >
              <AlertTriangle size={15} />
              Recall Batch
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => action("restore")}
            >
              <RotateCcw size={15} />
              Restore Batch
            </button>

            <Link className="btn btn-primary" to={`/verify?batch=${id}`}>
              <ShieldCheck size={15} />
              Verify
            </Link>
          </div>

          {message && <p className="action-message">{message}</p>}
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

        .detail-grid {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 20px;
        }

        .overview-card,
        .verification-card,
        .information-card,
        .actions-card {
          padding: 25px;
        }

        .detail-icon {
          width: 55px;
          height: 55px;
          border-radius: 17px;
          display: grid;
          place-items: center;
          color: var(--green);
          background: #e5eee9;
        }

        .overview-card h2 {
          margin: 18px 0 3px;
          font-size: 20px;
        }

        .muted {
          color: var(--muted);
          font-size: 12px;
        }

        .detail-stats {
          margin-top: 26px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .detail-stats div,
        .info-list div {
          padding: 14px;
          border-radius: 14px;
          background: #f2f2ed;
        }

        .detail-stats span,
        .info-list span {
          display: block;
          color: var(--muted);
          font-size: 10px;
          margin-bottom: 5px;
        }

        .detail-stats strong,
        .info-list strong {
          font-size: 13px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 11px;
          color: var(--green);
        }

        .section-title h2 {
          color: var(--ink);
          margin: 0;
          font-size: 16px;
        }

        .section-title p {
          color: var(--muted);
          margin: 3px 0 0;
          font-size: 11px;
        }

        .verification-status {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-top: 25px;
          padding: 18px;
          border-radius: 17px;
          background: #f2f2ed;
        }

        .proof-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #e5eee9;
          color: var(--green);
        }

        .verification-status strong {
          font-size: 13px;
        }

        .verification-status p {
          color: var(--muted);
          font-size: 11px;
          line-height: 1.5;
          margin: 4px 0 0;
        }

        .info-list {
          display: grid;
          gap: 10px;
          margin-top: 22px;
        }

        .info-list div {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-list span {
          margin: 0;
        }

        .action-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        .action-message {
          color: var(--red);
          font-size: 11px;
        }

        @media(max-width:800px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppShell>
  );
}
