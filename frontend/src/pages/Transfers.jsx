import { useEffect, useState } from "react";
import { ArrowLeftRight, Plus, Package, Clock3, CheckCircle, X } from "lucide-react";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import { getTransfers, createTransfer, completeTransfer, getReceivers } from "../services/transferService";
import { getBatches } from "../services/batchService";
import { getUser } from "../utils/auth";

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [batches, setBatches] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedReceiver, setSelectedReceiver] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [error, setError] = useState("");

  const currentUser = getUser();
  const currentUserId = currentUser?.id || currentUser?._id;

  const fetchTransfers = () => {
    setLoading(true);
    getTransfers()
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.transfers;
        if (items) setTransfers(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const openModal = async () => {
    setError("");
    setShowModal(true);
    try {
      const [batchesData, receiversData] = await Promise.all([
        getBatches(),
        getReceivers()
      ]);
      const bList = Array.isArray(batchesData) ? batchesData : batchesData?.batches || [];
      const rList = Array.isArray(receiversData) ? receiversData : receiversData?.receivers || [];
      setBatches(bList.filter(b => b.status === "ACTIVE"));
      setReceivers(rList);
    } catch {
      setError("Failed to load options for transfer.");
    }
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    if (!selectedBatch || !selectedReceiver) {
      setError("Please select both a batch and a receiver.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      await createTransfer({ batch: selectedBatch, to: selectedReceiver });
      setShowModal(false);
      setSelectedBatch("");
      setSelectedReceiver("");
      fetchTransfers();
    } catch (err) {
      const data = err?.response?.data;
      let msg = data?.error || data?.message || "Failed to initiate transfer.";
      if (data?.message && data?.error && !data.error.includes(data.message)) {
        msg = `${data.message} (${data.error})`;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmTransfer = async (transferId) => {
    setConfirmingId(transferId);
    try {
      await completeTransfer(transferId);
      fetchTransfers();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to confirm handover.");
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Transfers</h1>
          <p>Follow custody movement between supply-chain participants.</p>
        </div>

        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={16} />
          New Transfer
        </button>
      </div>

      <div className="transfer-layout">
        <section className="clay-card transfer-list">
          <div className="transfer-title">
            <ArrowLeftRight size={19} />
            <div>
              <h2>Transfer History</h2>
              <p>Recent custody movements</p>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : transfers.length === 0 ? (
            <div className="empty-state">No custody transfers recorded yet.</div>
          ) : (
            <div className="transfer-items">
              {transfers.map((transfer, index) => {
                const isReceiver = (transfer.to?._id || transfer.to?.id || transfer.to) === currentUserId;
                const isPending = transfer.status === "PENDING";

                return (
                  <div className="transfer-item" key={transfer._id || transfer.id || index}>
                    <div className="transfer-icon">
                      <ArrowLeftRight size={18} />
                    </div>

                    <div className="transfer-main">
                      <div className="transfer-top">
                        <strong>{transfer.batch?.batchNumber ? `Batch: ${transfer.batch.batchNumber}` : `TR-${index + 1}`}</strong>
                        <StatusBadge status={transfer.status || "IN_TRANSIT"} />
                      </div>

                      <div className="transfer-route">
                        <span>{transfer.from?.name || "Sender"} ({transfer.from?.role || ""})</span>
                        <ArrowLeftRight size={13} />
                        <span>{transfer.to?.name || "Receiver"} ({transfer.to?.role || ""})</span>
                      </div>

                      <small>
                        <Package size={12} />
                        {transfer.batch?.medicine?.name || transfer.batch?.batchNumber || "Batch details"}
                      </small>
                    </div>

                    <div className="transfer-right">
                      {isReceiver && isPending && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleConfirmTransfer(transfer._id)}
                          disabled={confirmingId === transfer._id}
                          style={{ fontSize: "11px", padding: "6px 12px" }}
                        >
                          <CheckCircle size={13} />
                          {confirmingId === transfer._id ? "Confirming..." : "Confirm Custody"}
                        </button>
                      )}

                      <div className="transfer-time">
                        <Clock3 size={12} />
                        {transfer.createdAt ? new Date(transfer.createdAt).toLocaleDateString() : "-"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="clay-card transfer-info">
          <div className="big-transfer-icon">
            <ArrowLeftRight size={30} />
          </div>

          <h2>Supply-Chain Flow</h2>
          <p>
            PharmaChain uses a two-step initiate → confirm custody flow.
            Each participant explicitly accepts possession.
          </p>

          <div className="steps">
            <div>
              <b>01</b>
              <span>🏭 Manufacturer creates batch</span>
            </div>
            <div>
              <b>02</b>
              <span>🚚 Distributor receives &amp; transports</span>
            </div>
            <div>
              <b>03</b>
              <span>📦 Warehouse stores &amp; holds</span>
            </div>
            <div>
              <b>04</b>
              <span>💊 Pharmacy dispenses to patients</span>
            </div>
          </div>

          <div style={{ marginTop: "18px", padding: "12px", background: "#f2f2ed", borderRadius: "13px", fontSize: "10px", color: "var(--muted)", lineHeight: "1.7" }}>
            <strong style={{ color: "var(--ink)", display: "block", marginBottom: "4px" }}>How handovers work</strong>
            The current owner initiates a handover → the receiver confirms on-chain. Every step is recorded immutably on Ethereum.
          </div>
        </section>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="clay-card modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Initiate Transfer</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} style={{ marginTop: "20px" }}>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label>Select Batch to Transfer *</label>
                <select
                  className="input"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select a batch --</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.batchNumber} ({b.medicine?.name || "Medicine"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>Select Receiver (Distributor / Warehouse / Pharmacy) *</label>
                <select
                  className="input"
                  value={selectedReceiver}
                  onChange={(e) => setSelectedReceiver(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select a receiver --</option>
                  {receivers.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.role}) - {r.email}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div style={{ color: "var(--red)", fontSize: "12px", marginBottom: "16px" }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Initiating..." : "Initiate Handover"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .transfer-layout {
          display: grid;
          grid-template-columns: 1.4fr .6fr;
          gap: 20px;
        }

        .transfer-list,
        .transfer-info {
          padding: 25px;
        }

        .transfer-title {
          display: flex;
          gap: 11px;
          align-items: center;
          color: var(--green);
          margin-bottom: 23px;
        }

        .transfer-title h2 {
          color: var(--ink);
          margin: 0;
          font-size: 16px;
        }

        .transfer-title p {
          color: var(--muted);
          margin: 3px 0 0;
          font-size: 11px;
        }

        .transfer-items {
          display: grid;
          gap: 12px;
        }

        .transfer-item {
          display: flex;
          gap: 13px;
          align-items: center;
          padding: 16px;
          border-radius: 17px;
          background: #f3f3ee;
        }

        .transfer-icon {
          width: 43px;
          height: 43px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: #e4eee9;
          color: var(--green);
        }

        .transfer-main {
          flex: 1;
        }

        .transfer-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .transfer-top strong {
          font-size: 12px;
        }

        .transfer-route {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 6px 0;
          font-size: 11px;
        }

        .transfer-route svg {
          color: var(--green-2);
        }

        .transfer-main small {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--muted);
          font-size: 10px;
        }

        .transfer-time {
          color: var(--muted);
          font-size: 9px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .big-transfer-icon {
          width: 62px;
          height: 62px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          color: var(--green);
          background: #e5eee9;
        }

        .transfer-info h2 {
          margin: 20px 0 8px;
          font-size: 20px;
        }

        .transfer-info > p {
          color: var(--muted);
          font-size: 12px;
          line-height: 1.7;
        }

        .steps {
          margin-top: 25px;
          display: grid;
          gap: 10px;
        }

        .steps div {
          display: flex;
          gap: 11px;
          align-items: center;
          padding: 12px;
          border-radius: 13px;
          background: #f2f2ed;
        }

        .steps b {
          color: var(--gold);
          font-size: 11px;
        }

        .transfer-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }

        .modal-content {
          width: 90%;
          max-width: 480px;
          padding: 28px;
          position: relative;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .close-btn {
          border: 0;
          background: transparent;
          cursor: pointer;
          color: var(--muted);
        }

        @media(max-width:850px) {
          .transfer-layout {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width:600px) {
          .transfer-time {
            display: none;
          }
        }
      `}</style>
    </AppShell>
  );
}
