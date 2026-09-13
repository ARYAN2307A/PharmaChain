import { useEffect, useState } from "react";
import { ArrowLeftRight, Plus, Package, Clock3 } from "lucide-react";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import { getTransfers } from "../services/transferService";

const demoTransfers = [
  {
    id: "TR-1001",
    batch: "PC-PCM-24001",
    from: "PharmaCare",
    to: "Central Warehouse",
    status: "IN_TRANSIT",
    date: "Today, 10:30 AM"
  },
  {
    id: "TR-1002",
    batch: "PC-AMX-24012",
    from: "MediCore",
    to: "South Distribution Hub",
    status: "ACTIVE",
    date: "Yesterday, 4:15 PM"
  },
  {
    id: "TR-1003",
    batch: "PC-CET-24008",
    from: "HealthFirst",
    to: "City Pharmacy",
    status: "ACTIVE",
    date: "12 Sep 2026"
  }
];

export default function Transfers() {
  const [transfers, setTransfers] = useState(demoTransfers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransfers()
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.transfers;
        if (items?.length) setTransfers(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Transfers</h1>
          <p>Follow custody movement between supply-chain participants.</p>
        </div>

        <button className="btn btn-primary">
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
          ) : (
            <div className="transfer-items">
              {transfers.map((transfer, index) => (
                <div className="transfer-item" key={transfer._id || transfer.id || index}>
                  <div className="transfer-icon">
                    <ArrowLeftRight size={18} />
                  </div>

                  <div className="transfer-main">
                    <div className="transfer-top">
                      <strong>{transfer.id || `TR-${index + 1}`}</strong>
                      <StatusBadge status={transfer.status || "IN_TRANSIT"} />
                    </div>

                    <div className="transfer-route">
                      <span>{transfer.from || "Sender"}</span>
                      <ArrowLeftRight size={13} />
                      <span>{transfer.to || "Receiver"}</span>
                    </div>

                    <small>
                      <Package size={12} />
                      {transfer.batch || "Batch unavailable"}
                    </small>
                  </div>

                  <div className="transfer-time">
                    <Clock3 size={12} />
                    {transfer.date || "Date unavailable"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="clay-card transfer-info">
          <div className="big-transfer-icon">
            <ArrowLeftRight size={30} />
          </div>

          <h2>Two-step custody</h2>
          <p>
            PharmaChain uses an initiate → confirm flow so the receiving
            participant explicitly accepts custody.
          </p>

          <div className="steps">
            <div>
              <b>01</b>
              <span>Sender initiates handover</span>
            </div>
            <div>
              <b>02</b>
              <span>Receiver confirms custody</span>
            </div>
          </div>
        </section>
      </div>

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

        .steps span {
          font-size: 11px;
          font-weight: 600;
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
