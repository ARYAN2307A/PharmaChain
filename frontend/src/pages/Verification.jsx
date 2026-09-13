import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  BadgeCheck,
  Search,
  ShieldCheck,
  Package,
  ArrowRight,
  AlertTriangle
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

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Verification</h1>
          <p>Check whether a batch is registered and traceable.</p>
        </div>
      </div>

      <div className="verification-page">
        <section className="clay-card verify-search-card">
          <div className="verify-hero-icon">
            <ShieldCheck size={31} />
          </div>

          <h2>Verify a medicine batch</h2>
          <p>
            Enter the batch identifier to request verification from the
            connected backend.
          </p>

          <div className="verify-input">
            <Search size={18} />
            <input
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              placeholder="Enter batch ID"
            />
          </div>

          <button
            className="btn btn-primary verify-button"
            onClick={verify}
            disabled={loading}
          >
            <BadgeCheck size={16} />
            {loading ? "Checking..." : "Verify Batch"}
          </button>

          <div className="verification-note">
            <AlertTriangle size={14} />
            Blockchain verification will only show confirmed data after
            blockchain integration is connected.
          </div>
        </section>

        {result && (
          <section className="clay-card result-card">
            {result.success ? (
              <>
                <div className="result-success">
                  <BadgeCheck size={29} />
                </div>

                <div className="result-head">
                  <div>
                    <span>VERIFICATION RESULT</span>
                    <h2>Batch record found</h2>
                  </div>
                  <StatusBadge
                    status={result.data?.status || "ACTIVE"}
                  />
                </div>

                <div className="result-details">
                  <div>
                    <Package size={18} />
                    <span>Batch</span>
                    <strong>{batchId}</strong>
                  </div>

                  <div>
                    <ShieldCheck size={18} />
                    <span>Blockchain</span>
                    <strong>Integration pending</strong>
                  </div>
                </div>

                <Link
                  className="btn btn-secondary"
                  to={`/batches/${batchId}`}
                >
                  View Batch Details
                  <ArrowRight size={15} />
                </Link>
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
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .verify-search-card {
          padding: 38px;
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

        .verification-note {
          max-width: 550px;
          margin: 20px auto 0;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 13px;
          background: #f7efd9;
          color: #876522;
          font-size: 10px;
        }

        .result-card {
          padding: 28px;
        }

        .result-success,
        .result-error {
          width: 55px;
          height: 55px;
          border-radius: 17px;
          display: grid;
          place-items: center;
        }

        .result-success {
          color: #347151;
          background: #e4f2e9;
        }

        .result-error {
          color: var(--red);
          background: #fde9e7;
        }

        .result-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 18px 0;
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
          margin-bottom: 18px;
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

        .result-error + h2 {
          margin-bottom: 5px;
        }

        .result-card > p {
          color: var(--muted);
          font-size: 12px;
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
