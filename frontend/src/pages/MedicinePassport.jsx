import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pill,
  ShieldCheck,
  Package,
  MapPin,
  CalendarDays,
  ArrowRight,
  Layers,
  UserCheck,
  QrCode,
  ExternalLink
} from "lucide-react";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import { getMedicinePassport } from "../services/batchService";

export default function MedicinePassport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [passport, setPassport] = useState(null);
  const [blockchain, setBlockchain] = useState(null);
  const [blockchainSummary, setBlockchainSummary] = useState([]);
  const [selectedBatchIndex, setSelectedBatchIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMedicinePassport(id)
      .then((data) => {
        if (data.passport) setPassport(data.passport);
        if (data.blockchain) setBlockchain(data.blockchain);
        if (data.blockchainSummary) setBlockchainSummary(data.blockchainSummary);
      })
      .catch(() => {
        setError("Failed to load medicine passport.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="page-header">
          <div>
            <h1>Loading...</h1>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !passport) {
    return (
      <AppShell>
        <div className="page-header">
          <div>
            <button className="back-link" onClick={() => navigate(-1)}>
              <ArrowLeft size={15} /> Back
            </button>
            <h1>{error || "Passport not found"}</h1>
          </div>
        </div>
      </AppShell>
    );
  }

  const medicine = passport.medicine || passport.batch?.medicine;
  const batches = passport.batches && passport.batches.length > 0
    ? passport.batches
    : (passport.batch ? [passport.batch] : []);
  
  const activeBatch = batches[selectedBatchIndex] || passport.batch || null;
  const transfers = passport.transfers || [];

  const totalQuantity = batches.reduce((sum, b) => sum + (b.quantity || 0), 0);
  const activeCount = batches.filter(b => b.status === "ACTIVE").length;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back
          </button>
          <h1>Medicine Passport</h1>
          <p>Digital identity & batch supply-chain overview for <strong>{medicine?.name}</strong>.</p>
        </div>
      </div>

      <div className="passport-layout">
        {/* Left Card: Medicine Metadata */}
        <section className="clay-card passport-hero">
          <div className="passport-pill">
            <Pill size={34} />
          </div>

          <span className="passport-label">MEDICINE IDENTITY</span>
          <h2>{medicine?.name}</h2>
          <p>{medicine?.description || "Master record and multi-batch digital passport."}</p>

          <div className="passport-id">{medicine?._id || medicine?.id}</div>

          <div className="passport-stats">
            <div className="stat-box">
              <span className="stat-label">Total Batches</span>
              <strong className="stat-val">{batches.length}</strong>
            </div>
            <div className="stat-box">
              <span className="stat-label">Active Batches</span>
              <strong className="stat-val" style={{ color: "var(--green)" }}>{activeCount}</strong>
            </div>
            <div className="stat-box">
              <span className="stat-label">Total Units</span>
              <strong className="stat-val">{totalQuantity.toLocaleString()}</strong>
            </div>
          </div>

          <div className="passport-details">
            <div>
              <span>Generic name</span>
              <strong>{medicine?.genericName || "-"}</strong>
            </div>

            <div>
              <span>Category</span>
              <strong>{medicine?.category || "-"}</strong>
            </div>

            <div>
              <span>Manufacturer</span>
              <strong>{medicine?.manufacturer || "-"}</strong>
            </div>

            <div>
              <span>Dosage</span>
              <strong>{medicine?.dosage || "-"}</strong>
            </div>
          </div>
        </section>

        {/* Right Card: Trust & Blockchain Verification */}
        <section className="clay-card passport-trust">
          <div className="trust-header">
            <ShieldCheck size={22} />
            <div>
              <h2>Trust & Blockchain Proof</h2>
              <p>Selected Batch: <strong>{activeBatch?.batchNumber || "No Batch Selected"}</strong></p>
            </div>
          </div>

          <div className="trust-row">
            <div className="trust-icon">
              <Package size={18} />
            </div>
            <div>
              <strong>Batch Identity</strong>
              <span>{activeBatch?.batchNumber ? `Batch ${activeBatch.batchNumber}` : "No active batch registered"}</span>
            </div>
            <StatusBadge status={activeBatch?.status || "ACTIVE"} />
          </div>

          <div className="trust-row">
            <div className="trust-icon">
              <UserCheck size={18} />
            </div>
            <div>
              <strong>Current Owner Custody</strong>
              <span>
                {activeBatch?.currentOwner?.name
                  ? `${activeBatch.currentOwner.name} (${activeBatch.currentOwner.role || "OWNER"})`
                  : "Manufacturer"}
              </span>
            </div>
            <StatusBadge status={activeBatch?.lifecycleState || "CREATED"} />
          </div>

          <div className="trust-row">
            <div className="trust-icon">
              <MapPin size={18} />
            </div>
            <div>
              <strong>Supply-Chain Transfers</strong>
              <span>{transfers.length} handover record(s) logged</span>
            </div>
            <StatusBadge status="ACTIVE" />
          </div>

          <div className="trust-row">
            <div className="trust-icon">
              <CalendarDays size={18} />
            </div>
            <div>
              <strong>Blockchain Verification</strong>
              <span>{blockchain?.valid ? "Cryptographically verified on Ethereum smart contract" : "Verification pending or invalid"}</span>
            </div>
            <span className={`status ${blockchain?.valid ? "status-active" : "status-neutral"}`}>
              {blockchain?.valid ? "VERIFIED" : "PENDING"}
            </span>
          </div>

          {activeBatch && (
            <Link
              to={`/verify?batch=${activeBatch.batchNumber}`}
              className="btn btn-primary passport-button"
            >
              <QrCode size={16} /> Verify Batch {activeBatch.batchNumber} <ArrowRight size={15} />
            </Link>
          )}
        </section>
      </div>

      {/* Multiple Batches Overview Section */}
      <section className="clay-card batches-section" style={{ marginTop: "25px", padding: "28px" }}>
        <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Layers size={22} style={{ color: "var(--green)" }} />
            <div>
              <h2 style={{ margin: 0, fontSize: "18px" }}>Associated Batches ({batches.length})</h2>
              <p style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: "11px" }}>
                All registered manufacturing batches for {medicine?.name}
              </p>
            </div>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="empty-state" style={{ padding: "30px", textAlign: "center", color: "var(--muted)", fontSize: "12px" }}>
            No batches registered for this medicine yet.
          </div>
        ) : (
          <div className="batch-grid">
            {batches.map((b, idx) => {
              const isSelected = idx === selectedBatchIndex;
              const chainInfo = blockchainSummary.find(
                s => s.batchNumber === b.batchNumber || String(s.batchId) === String(b._id)
              );
              return (
                <div
                  key={b._id || b.id || idx}
                  className={`batch-card-item ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedBatchIndex(idx)}
                >
                  <div className="batch-card-top">
                    <div className="batch-num-tag">
                      <Package size={14} />
                      <strong>{b.batchNumber}</strong>
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {chainInfo && (
                        <span
                          className={`status ${chainInfo.valid ? "status-active" : "status-neutral"}`}
                          style={{ fontSize: "8px" }}
                          title={chainInfo.valid ? "Verified on blockchain" : chainInfo.expired ? "Expired on-chain" : "Not found on chain"}
                        >
                          {chainInfo.valid ? "⛓ ON-CHAIN" : chainInfo.expired ? "⛓ EXPIRED" : "⛓ PENDING"}
                        </span>
                      )}
                      <StatusBadge status={b.status || "ACTIVE"} />
                    </div>
                  </div>

                  <div className="batch-card-body">
                    <div className="info-pair">
                      <span>Quantity:</span>
                      <strong>{b.quantity ? b.quantity.toLocaleString() : "-"} units</strong>
                    </div>

                    <div className="info-pair">
                      <span>Lifecycle:</span>
                      <strong style={{ color: "var(--green-2)" }}>{b.lifecycleState || "CREATED"}</strong>
                    </div>

                    <div className="info-pair">
                      <span>Custody Owner:</span>
                      <strong>{b.currentOwner?.name || "Manufacturer"} ({b.currentOwner?.role || "MANUFACTURER"})</strong>
                    </div>

                    <div className="info-pair">
                      <span>Expiry Date:</span>
                      <strong>{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : "-"}</strong>
                    </div>
                  </div>

                  <div className="batch-card-actions" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/batches/${b._id}`} className="btn-link">
                      View Details <ExternalLink size={12} />
                    </Link>
                    <Link to={`/verify?batch=${b.batchNumber}`} className="btn-link green">
                      Verify <QrCode size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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
          cursor: pointer;
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

        .passport-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 20px;
        }

        .stat-box {
          background: #f2f2ed;
          padding: 12px;
          border-radius: 14px;
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 9px;
          color: var(--muted);
          margin-bottom: 4px;
        }

        .stat-val {
          font-size: 15px;
          font-weight: 700;
        }

        .passport-details {
          margin-top: 20px;
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
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .batch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .batch-card-item {
          background: #f6f6f1;
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .batch-card-item:hover {
          background: #ebebe5;
          transform: translateY(-2px);
        }

        .batch-card-item.selected {
          border-color: var(--green);
          background: #eef5f1;
        }

        .batch-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .batch-num-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--ink);
          font-size: 13px;
        }

        .batch-card-body {
          display: grid;
          gap: 8px;
          font-size: 11px;
          margin-bottom: 14px;
        }

        .info-pair {
          display: flex;
          justify-content: space-between;
          color: var(--muted);
        }

        .info-pair strong {
          color: var(--ink);
        }

        .batch-card-actions {
          display: flex;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #e0e0d8;
        }

        .btn-link {
          font-size: 11px;
          color: var(--muted);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
        }

        .btn-link:hover {
          color: var(--ink);
        }

        .btn-link.green {
          color: var(--green);
        }

        @media(max-width:800px) {
          .passport-layout {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width:500px) {
          .passport-details,
          .passport-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppShell>
  );
}
