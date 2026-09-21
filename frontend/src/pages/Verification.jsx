import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  BadgeCheck,
  Search,
  ShieldCheck,
  Package,
  ArrowRight,
  AlertTriangle,
  XCircle,
  Clock,
  UserCheck,
  Flame
} from "lucide-react";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import { verifyBatch } from "../services/batchService";

export default function Verification() {
  const [params] = useSearchParams();

  const [batchId, setBatchId] = useState(params.get("batch") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (!batchId.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await verifyBatch(batchId.trim());
      setResult({
        success: true,
        data
      });
    } catch {
      setResult({
        success: false,
        message:
          "Verification service is unavailable or the batch could not be verified."
      });
    } finally {
      setLoading(false);
    }
  };

  // Determine consumer verification status verdict
  const getVerdict = (data) => {
    if (!data) return { status: "INVALID", label: "INVALID BATCH", class: "verdict-invalid" };
    
    const batch = data.batch;
    const blockchain = data.blockchain;

    if (batch?.status === "RECALLED") {
      return {
        status: "RECALLED",
        label: "DANGER: BATCH RECALLED",
        message: "This batch has been officially RECALLED by authorities or manufacturer. DO NOT CONSUME OR DISPENSE!",
        color: "var(--red)",
        bg: "#fdeea",
        icon: <AlertTriangle size={32} />
      };
    }

    if (batch?.status === "EXPIRED" || (batch?.expiryDate && new Date(batch.expiryDate) < new Date())) {
      return {
        status: "EXPIRED",
        label: "WARNING: BATCH EXPIRED",
        message: "This batch has passed its safety expiration date. Discard product immediately.",
        color: "#c8860a",
        bg: "#fef7e4",
        icon: <Clock size={32} />
      };
    }

    if (!data.verified || !blockchain?.valid) {
      return {
        status: "SUSPICIOUS",
        label: "SUSPICIOUS / UNVERIFIED",
        message: "Blockchain proof mismatch or missing on Ethereum smart contract. Product authenticity cannot be guaranteed.",
        color: "var(--red)",
        bg: "#fdeea",
        icon: <XCircle size={32} />
      };
    }

    return {
      status: "VERIFIED",
      label: "GENUINE & VERIFIED",
      message: "Authentic batch cryptographically verified on Ethereum smart contract. Safe for use.",
      color: "var(--green)",
      bg: "#e4f2e9",
      icon: <BadgeCheck size={32} />
    };
  };

  const verdict = result?.success ? getVerdict(result.data) : null;

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Medicine Batch Verification</h1>
          <p>Instant consumer verification linked directly to Ethereum smart contract proof.</p>
        </div>
      </div>

      <div className="verification-page">
        <section className="clay-card verify-search-card">
          <div className="verify-hero-icon">
            <ShieldCheck size={31} />
          </div>

          <h2>Verify a medicine package</h2>
          <p>
            Enter the batch number or ID from the medicine carton to inspect authentic supply-chain provenance.
          </p>

          <div className="verify-input">
            <Search size={18} />
            <input
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              placeholder="Enter batch ID (e.g. PC-PCM-24001)"
            />
          </div>

          <button
            className="btn btn-primary verify-button"
            onClick={verify}
            disabled={loading}
          >
            <BadgeCheck size={16} />
            {loading ? "Verifying On-Chain..." : "Verify Batch"}
          </button>
        </section>

        {result && (
          <section className="clay-card result-card">
            {result.success ? (
              <>
                {/* Consumer Alert Banner */}
                <div
                  className="verdict-banner"
                  style={{
                    backgroundColor: verdict.bg,
                    borderColor: verdict.color,
                    color: verdict.color
                  }}
                >
                  <div className="verdict-icon">{verdict.icon}</div>
                  <div>
                    <span className="verdict-title">{verdict.label}</span>
                    <p className="verdict-msg">{verdict.message}</p>
                  </div>
                </div>

                <div className="result-head">
                  <div>
                    <span>BLOCKCHAIN AUDIT SUMMARY</span>
                    <h2>{result.data?.batch?.medicine?.name || "Medicine Batch"}</h2>
                  </div>
                  <StatusBadge status={result.data?.batch?.status || "ACTIVE"} />
                </div>

                <div className="result-details">
                  <div>
                    <Package size={18} />
                    <span>Batch Number</span>
                    <strong>{result.data?.batch?.batchNumber || batchId}</strong>
                  </div>

                  <div>
                    <ShieldCheck size={18} />
                    <span>Blockchain Ledger</span>
                    <strong>{result.data?.blockchain?.valid ? "VERIFIED ON-CHAIN" : "UNVERIFIED"}</strong>
                  </div>

                  <div>
                    <UserCheck size={18} />
                    <span>Current Owner</span>
                    <strong>
                      {result.data?.batch?.currentOwner?.name || "Manufacturer"} ({result.data?.batch?.currentOwner?.role || "OWNER"})
                    </strong>
                  </div>

                  <div>
                    <Clock size={18} />
                    <span>Expiry Date</span>
                    <strong>
                      {result.data?.batch?.expiryDate
                        ? new Date(result.data.batch.expiryDate).toLocaleDateString()
                        : "-"}
                    </strong>
                  </div>
                </div>

                <div className="verdict-actions">
                  <Link
                    className="btn btn-primary"
                    to={`/batches/${result.data?.batch?._id || batchId}`}
                  >
                    View Batch Details
                    <ArrowRight size={15} />
                  </Link>

                  {result.data?.batch?.medicine && (
                    <Link
                      className="btn btn-secondary"
                      to={`/medicines/${result.data.batch.medicine._id || result.data.batch.medicine}`}
                    >
                      Open Medicine Passport <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="result-error">
                  <AlertTriangle size={29} />
                </div>

                <h2>Unable to verify</h2>
                <p>{result.message}</p>
              </>
            )}
          </section>
        )}
      </div>

      <style>{`
        .verification-page {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .verify-search-card {
          padding: 35px;
          text-align: center;
        }

        .verify-hero-icon {
          width: 70px;
          height: 70px;
          border-radius: 22px;
          display: grid;
          place-items: center;
          margin: 0 auto;
          color: var(--green);
          background: #e5eee9;
        }

        .verify-search-card h2 {
          font-size: 24px;
          margin: 20px 0 8px;
        }

        .verify-search-card > p {
          max-width: 520px;
          margin: 0 auto 25px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.7;
        }

        .verify-input {
          max-width: 550px;
          margin: 0 auto 13px;
          position: relative;
        }

        .verify-input svg {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
        }

        .verify-input input {
          width: 100%;
          border: 0;
          outline: 0;
          padding: 16px 18px 16px 46px;
          border-radius: 16px;
          background: var(--bg);
          box-shadow: inset 3px 3px 8px rgba(54,59,55,.08);
        }

        .verify-button {
          min-width: 170px;
        }

        .verdict-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border-radius: 18px;
          border: 2px solid;
          margin-bottom: 22px;
        }

        .verdict-title {
          display: block;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.5px;
        }

        .verdict-msg {
          margin: 4px 0 0;
          font-size: 11px;
          line-height: 1.5;
        }

        .result-card {
          padding: 28px;
        }

        .result-error {
          width: 55px;
          height: 55px;
          border-radius: 17px;
          display: grid;
          place-items: center;
          color: var(--red);
          background: #fde9e7;
          margin-bottom: 12px;
        }

        .result-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .result-head span {
          font-size: 9px;
          color: var(--green-2);
          font-weight: 800;
          letter-spacing: 1px;
        }

        .result-head h2 {
          margin: 4px 0 0;
          font-size: 18px;
        }

        .result-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 22px;
        }

        .result-details div {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 2px 9px;
          padding: 15px;
          border-radius: 15px;
          background: #f2f2ed;
          color: var(--green);
        }

        .result-details span {
          color: var(--muted);
          font-size: 9px;
        }

        .result-details strong {
          grid-column: 2;
          color: var(--ink);
          font-size: 11px;
        }

        .verdict-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        @media(max-width:600px) {
          .verify-search-card {
            padding: 25px 18px;
          }

          .result-details {
            grid-template-columns: 1fr;
          }

          .result-head {
            align-items: flex-start;
            gap: 10px;
            flex-direction: column;
          }
        }
      `}</style>
    </AppShell>
  );
}
