import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ShieldCheck,
  Clock3,
  AlertTriangle,
  RotateCcw,
  Download,
  ArrowRight,
  CheckCircle2,
  Circle,
  Truck,
  Building2,
  FlaskConical,
  Store,
  User,
  Loader2
} from "lucide-react";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import { verifyBatch, recallBatch, restoreBatch, getBatchQR, updateLifecycle } from "../services/batchService";
import { getBatchTransfers } from "../services/transferService";

// Role → icon mapping
const roleIcon = (role) => {
  const r = String(role || "").toUpperCase();
  if (r === "MANUFACTURER") return <FlaskConical size={16} />;
  if (r === "DISTRIBUTOR")  return <Truck size={16} />;
  if (r === "WAREHOUSE")    return <Building2 size={16} />;
  if (r === "PHARMACY")     return <Store size={16} />;
  return <User size={16} />;
};

const roleLabel = (role) => {
  const r = String(role || "").toUpperCase();
  return r.charAt(0) + r.slice(1).toLowerCase();
};

export default function BatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [batch,        setBatch]        = useState(null);
  const [verification, setVerification] = useState(null);
  const [qrCode,       setQrCode]       = useState(null);
  const [transfers,    setTransfers]    = useState([]);
  const [message,      setMessage]      = useState("");
  const [loading,      setLoading]      = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [vData, qrData] = await Promise.allSettled([verifyBatch(id), getBatchQR(id)]);
        if (vData.status === "fulfilled") {
          setVerification(vData.value);
          if (vData.value?.batch) setBatch(vData.value.batch);
        }
        if (qrData.status === "fulfilled" && qrData.value?.qrCode) {
          setQrCode(qrData.value.qrCode);
        }

        // Fetch transfers — use batch._id if available, otherwise the route id
        const batchId = vData.value?.batch?._id || id;
        try {
          const tData = await getBatchTransfers(batchId);
          setTransfers(Array.isArray(tData) ? tData : []);
        } catch {
          setTransfers([]);
        }
      } catch {
        setMessage("Failed to load batch details.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const action = async (type) => {
    setMessage("");
    setActionLoading(type);
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
      setMessage("Action failed. Ensure blockchain node is running and you have the required role.");
    } finally {
      setActionLoading("");
    }
  };

  const handleAdvanceLifecycle = async () => {
    if (!batch) return;
    const nextMap = {
      CREATED: "DISPATCHED",
      DISPATCHED: "IN_TRANSIT",
      IN_TRANSIT: "RECEIVED",
      RECEIVED: "AT_PHARMACY",
      AT_PHARMACY: "SOLD"
    };

    const nextState = nextMap[batch.lifecycleState || "CREATED"];
    if (!nextState) {
      setMessage("Batch has already reached final lifecycle state (SOLD).");
      return;
    }

    setMessage("");
    setActionLoading("lifecycle");
    try {
      await updateLifecycle(batch._id || id, nextState);
      setBatch((b) => ({ ...b, lifecycleState: nextState }));
      setMessage(`Lifecycle updated on-chain to ${nextState}`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update lifecycle on-chain.";
      setMessage(`Lifecycle update failed: ${msg}`);
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="page-header">
          <div>
            <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
            <h1>Loading…</h1>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!batch) {
    return (
      <AppShell>
        <div className="page-header">
          <div>
            <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
            <h1>Batch not found</h1>
          </div>
        </div>
      </AppShell>
    );
  }

  // Build custody path: always starts with manufacturer
  // Each completed transfer adds a new node
  const custodyPath = [];

  // Step 0 — Manufacturer (creator)
  custodyPath.push({
    role:      batch.manufacturer?.role || "MANUFACTURER",
    name:      batch.manufacturer?.name || "Manufacturer",
    email:     batch.manufacturer?.email,
    time:      batch.createdAt,
    status:    "COMPLETED",
    label:     "Batch Created",
    transferId: null
  });

  // Steps from transfer history
  transfers.forEach((t) => {
    if (t.status === "COMPLETED" || t.status === "PENDING") {
      custodyPath.push({
        role:       t.to?.role   || "UNKNOWN",
        name:       t.to?.name   || "Unknown",
        email:      t.to?.email,
        time:       t.status === "COMPLETED" ? (t.completedAt || t.updatedAt) : null,
        status:     t.status,
        label:      t.status === "COMPLETED" ? "Custody Confirmed" : "Handover Pending",
        transferId: t._id
      });
    }
  });

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back
          </button>
          <h1>{batch.batchNumber}</h1>
          <p>{batch.medicine?.name}</p>
        </div>
        <StatusBadge status={batch.status} />
      </div>

      <div className="detail-grid">

        {/* ── Overview ─────────────────────────────────────── */}
        <section className="clay-card overview-card">
          <div className="detail-icon"><Package size={27} /></div>
          <h2>{batch.medicine?.name}</h2>
          <p className="muted">Traceable medicine batch</p>

          <div className="detail-stats">
            <div>
              <span>Quantity</span>
              <strong>{batch.quantity?.toLocaleString() || "-"} units</strong>
            </div>
            <div>
              <span>Current Owner</span>
              <strong>{batch.currentOwner?.name || batch.currentOwner || "-"}</strong>
            </div>
            <div>
              <span>Manufactured</span>
              <strong>{batch.manufacturingDate ? new Date(batch.manufacturingDate).toLocaleDateString() : "-"}</strong>
            </div>
            <div>
              <span>Expires</span>
              <strong>{batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : "-"}</strong>
            </div>
            <div>
              <span>Lifecycle</span>
              <strong>{batch.lifecycleState || "CREATED"}</strong>
            </div>
            <div>
              <span>Status</span>
              <StatusBadge status={batch.status} />
            </div>
          </div>
        </section>

        {/* ── Blockchain Verification ───────────────────────── */}
        <section className="clay-card batch-verification-card">
          <div className="section-title">
            <ShieldCheck size={20} />
            <div>
              <h2>Blockchain Verification</h2>
              <p>On-chain proof status</p>
            </div>
          </div>

          <div className="verification-status">
            <div className={`proof-circle ${verification?.verified ? "proof-ok" : "proof-fail"}`}>
              <ShieldCheck size={30} />
            </div>
            <div className="verification-text">
              <strong>
                {verification?.verified ? "✓ Verified on Ethereum" : "✗ Verification Failed"}
              </strong>
              <p>
                {verification?.verified
                  ? `Smart contract confirms this record is authentic. Lifecycle: ${verification?.blockchain?.lifecycle || batch.lifecycleState || "CREATED"}`
                  : verification?.reason || "This record was not found on the blockchain ledger."}
              </p>
              {verification?.blockchain?.currentOwner && (
                <p className="wallet-addr">
                  Chain owner: <code>{verification.blockchain.currentOwner}</code>
                </p>
              )}
            </div>
          </div>

          <div className="verify-links">
            <Link className="btn btn-primary btn-sm-link" to={`/verify?batch=${batch.batchNumber}`}>
              <ShieldCheck size={14} /> Full Verify
            </Link>
            <Link className="btn btn-secondary btn-sm-link" to={`/scan`}>
              Scan QR
            </Link>
          </div>
        </section>

        {/* ── Full Custody / Transfer Path ─────────────────── */}
        <section className="clay-card custody-card" style={{ gridColumn: "1 / -1" }}>
          <div className="section-title" style={{ marginBottom: "28px" }}>
            <Truck size={20} />
            <div>
              <h2>Custody Transfer Path</h2>
              <p>Full chain-of-custody from manufacturing to current holder</p>
            </div>
            <div style={{ marginLeft: "auto", fontSize: "11px", color: "var(--muted)" }}>
              {custodyPath.length - 1} handover{custodyPath.length !== 2 ? "s" : ""} recorded
            </div>
          </div>

          {custodyPath.length === 1 ? (
            <div className="custody-empty">
              <Circle size={16} />
              No transfers yet — batch is still with the manufacturer.
            </div>
          ) : null}

          <div className="custody-path">
            {custodyPath.map((node, idx) => {
              const isLast     = idx === custodyPath.length - 1;
              const isDone     = node.status === "COMPLETED";
              const isPending  = node.status === "PENDING";

              return (
                <div className="custody-step" key={idx}>
                  {/* Left: connector line */}
                  <div className="step-line-col">
                    <div className={`step-dot ${isDone ? "dot-done" : isPending ? "dot-pending" : "dot-done"}`}>
                      {isDone ? <CheckCircle2 size={16} /> : isPending ? <Loader2 size={14} className="spin-slow" /> : <CheckCircle2 size={16} />}
                    </div>
                    {!isLast && <div className={`step-line ${isDone ? "line-done" : "line-pending"}`} />}
                  </div>

                  {/* Right: node content */}
                  <div className={`step-body ${isLast ? "step-current" : ""}`}>
                    <div className="step-top">
                      <div className={`step-role-icon role-${node.role.toLowerCase()}`}>
                        {roleIcon(node.role)}
                      </div>
                      <div className="step-info">
                        <strong>{node.name}</strong>
                        <span className="step-role">{roleLabel(node.role)}</span>
                        {node.email && <span className="step-email">{node.email}</span>}
                      </div>
                      <div className="step-right">
                        <StatusBadge status={node.role} />
                        {node.time && (
                          <span className="step-time">
                            <Clock3 size={11} />
                            {new Date(node.time).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </span>
                        )}
                        {isPending && !node.time && (
                          <span className="step-time pending-time">Awaiting confirmation</span>
                        )}
                      </div>
                    </div>

                    <div className="step-label">
                      {idx === 0 ? (
                        <span className="label-chip label-created">📦 {node.label}</span>
                      ) : isDone ? (
                        <span className="label-chip label-done">✓ {node.label}</span>
                      ) : (
                        <span className="label-chip label-pending">⏳ {node.label}</span>
                      )}

                      {!isLast && (
                        <span className="handoff-arrow">
                          Handed off to {custodyPath[idx + 1]?.name} <ArrowRight size={11} />
                        </span>
                      )}
                      {isLast && (
                        <span className="label-chip label-current">📍 Current Holder</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Safety Actions ───────────────────────────────── */}
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
              className="btn btn-primary"
              onClick={handleAdvanceLifecycle}
              disabled={!!actionLoading || batch.lifecycleState === "SOLD"}
            >
              {actionLoading === "lifecycle"
                ? <Loader2 size={15} className="spin-slow" />
                : <ArrowRight size={15} />}
              Advance Lifecycle ({batch.lifecycleState || "CREATED"})
            </button>

            <button
              className="btn btn-danger"
              onClick={() => action("recall")}
              disabled={!!actionLoading}
            >
              {actionLoading === "recall"
                ? <Loader2 size={15} className="spin-slow" />
                : <AlertTriangle size={15} />}
              Recall Batch
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => action("restore")}
              disabled={!!actionLoading}
            >
              {actionLoading === "restore"
                ? <Loader2 size={15} className="spin-slow" />
                : <RotateCcw size={15} />}
              Restore Batch
            </button>

            <Link className="btn btn-secondary" to={`/verify?batch=${batch.batchNumber}`}>
              <ShieldCheck size={15} /> Verify
            </Link>
          </div>

          {message && <p className="action-message">{message}</p>}
        </section>

        {/* ── QR Code ─────────────────────────────────────── */}
        {qrCode && (
          <section
            className="clay-card qr-card"
            style={{
              padding: "25px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              flexWrap: "wrap"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ background: "#fff", padding: "12px", borderRadius: "16px", boxShadow: "inset 0 0 0 1px #e2e2dc" }}>
                <img src={qrCode} alt="Batch QR Code" style={{ width: "110px", height: "110px", display: "block" }} />
              </div>
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: "16px" }}>Digital Batch Identity (QR Code)</h3>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: "12px", maxWidth: "420px" }}>
                  Scan this QR code with any camera or the built-in scanner to instantly verify
                  on-chain provenance for <strong>{batch.batchNumber}</strong>.
                </p>
              </div>
            </div>

            <a
              className="btn btn-secondary"
              href={qrCode}
              download={`QR_${batch.batchNumber}.png`}
              style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
            >
              <Download size={16} /> Download QR
            </a>
          </section>
        )}
      </div>

      <style>{`
        @keyframes spinSlow { to { transform: rotate(360deg); } }
        .spin-slow { animation: spinSlow 1.2s linear infinite; }

        .back-link {
          border: 0; background: transparent; color: var(--muted);
          display: flex; gap: 6px; align-items: center;
          padding: 0; margin-bottom: 12px; font-size: 12px; cursor: pointer;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 20px;
        }

        .overview-card,
        .batch-verification-card,
        .information-card,
        .actions-card { padding: 25px; }

        .detail-icon {
          width: 55px; height: 55px; border-radius: 17px;
          display: grid; place-items: center;
          color: var(--green); background: #e5eee9;
        }

        .overview-card h2 { margin: 18px 0 3px; font-size: 20px; }
        .muted { color: var(--muted); font-size: 12px; }

        .detail-stats {
          margin-top: 26px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .detail-stats div {
          padding: 14px; border-radius: 14px; background: #f2f2ed;
        }

        .detail-stats span {
          display: block; color: var(--muted); font-size: 10px; margin-bottom: 5px;
        }

        .detail-stats strong { font-size: 12px; }

        .section-title {
          display: flex; align-items: center; gap: 11px; color: var(--green);
        }
        .section-title h2 { color: var(--ink); margin: 0; font-size: 16px; }
        .section-title p  { color: var(--muted); margin: 3px 0 0; font-size: 11px; }

        .verification-status {
          display: flex; gap: 15px; align-items: flex-start;
          margin-top: 20px; padding: 18px;
          border-radius: 17px; background: #f2f2ed;
        }

        .proof-circle {
          width: 50px; height: 50px; border-radius: 50%;
          display: grid; place-items: center;
          background: #e5eee9; color: var(--green); flex-shrink: 0;
        }
        .proof-ok   { background: #e5eee9; color: var(--green); }
        .proof-fail { background: #fdecea; color: var(--red, #c0392b); }

        .verification-text { flex: 1; min-width: 0; }
        .verification-text strong { font-size: 13px; }
        .verification-text p {
          color: var(--muted); font-size: 11px;
          line-height: 1.6; margin: 4px 0 0;
        }

        .wallet-addr {
          margin-top: 6px !important;
        }
        .wallet-addr code {
          font-size: 9px; background: #e8e8e2;
          padding: 2px 6px; border-radius: 5px;
          word-break: break-all;
        }

        .verify-links {
          display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap;
        }

        .btn-sm-link {
          font-size: 11px !important;
          padding: 7px 14px !important;
          display: flex; align-items: center; gap: 6px;
          text-decoration: none;
        }

        /* ── Custody Path ───────────────────────────────── */
        .custody-card { padding: 28px; }

        .custody-empty {
          display: flex; align-items: center; gap: 8px;
          color: var(--muted); font-size: 12px;
          padding: 20px; background: #f5f5f0; border-radius: 14px;
        }

        .custody-path {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .custody-step {
          display: flex;
          gap: 0;
          align-items: stretch;
        }

        /* Left connector column */
        .step-line-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 40px;
          flex-shrink: 0;
        }

        .step-dot {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: grid; place-items: center;
          flex-shrink: 0;
          z-index: 1;
        }

        .dot-done    { background: #e5eee9; color: var(--green); }
        .dot-pending { background: #fef7e4; color: #c8860a; }

        .step-line {
          width: 2px;
          flex: 1;
          min-height: 24px;
          margin: 4px 0;
        }
        .line-done    { background: var(--green); }
        .line-pending { background: repeating-linear-gradient(to bottom, #c8860a 0, #c8860a 6px, transparent 6px, transparent 12px); }

        /* Right body */
        .step-body {
          flex: 1;
          margin-left: 14px;
          margin-bottom: 24px;
          background: #f6f6f1;
          border-radius: 16px;
          padding: 16px 18px;
          transition: background 0.2s;
        }

        .step-current {
          background: #eef5f1;
          border: 1.5px solid var(--green);
        }

        .step-top {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .step-role-icon {
          width: 36px; height: 36px; border-radius: 11px;
          display: grid; place-items: center;
          flex-shrink: 0; font-size: 14px;
        }

        .role-manufacturer { background: #e5eee9; color: var(--green); }
        .role-distributor  { background: #e8f0f8; color: #2563eb; }
        .role-warehouse    { background: #f5f0e8; color: #92400e; }
        .role-pharmacy     { background: #f0e8f5; color: #7c3aed; }
        .role-unknown      { background: #f2f2ed; color: var(--muted); }

        .step-info { flex: 1; min-width: 0; }
        .step-info strong { display: block; font-size: 13px; }
        .step-role {
          display: block; font-size: 10px;
          color: var(--muted); margin-top: 2px;
          font-weight: 600; letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .step-email {
          display: block; font-size: 9px; color: var(--muted); margin-top: 1px;
        }

        .step-right {
          display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0;
        }

        .step-time {
          display: flex; align-items: center; gap: 4px;
          font-size: 9px; color: var(--muted);
        }
        .pending-time { color: #c8860a; }

        .step-label {
          margin-top: 10px;
          display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
        }

        .label-chip {
          font-size: 10px; font-weight: 700;
          padding: 3px 9px; border-radius: 20px;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .label-created { background: #e5eee9; color: var(--green); }
        .label-done    { background: #e5eee9; color: var(--green); }
        .label-pending { background: #fef7e4; color: #c8860a; }
        .label-current { background: #eef5f1; color: var(--green); border: 1px solid var(--green); }

        .handoff-arrow {
          font-size: 10px; color: var(--muted);
          display: flex; align-items: center; gap: 4px;
        }

        /* Safety Actions */
        .action-row {
          display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px;
        }

        .action-message { color: var(--red, #c0392b); font-size: 11px; margin-top: 10px; }

        @media(max-width:900px) {
          .detail-grid { grid-template-columns: 1fr; }
          .custody-card { grid-column: 1; }
        }
      `}</style>
    </AppShell>
  );
}
