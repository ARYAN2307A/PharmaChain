import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ScanLine,
  Camera,
  ShieldCheck,
  Keyboard,
  ArrowRight
} from "lucide-react";
import AppShell from "../components/AppShell";

export default function QRScanner() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [manual, setManual] = useState("");
  const [cameraStarted, setCameraStarted] = useState(false);

  const verifyManual = () => {
    if (!manual.trim()) return;
    navigate(`/verify?batch=${encodeURIComponent(manual.trim())}`);
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>QR Scanner</h1>
          <p>Scan a medicine package to open its verification record.</p>
        </div>
      </div>

      <div className="scanner-layout">
        <section className="clay-card scanner-card">
          <div className="scanner-header">
            <div className="scanner-icon">
              <ScanLine size={23} />
            </div>
            <div>
              <h2>Scan medicine QR</h2>
              <p>Camera access is required to scan a real code.</p>
            </div>
          </div>

          <div className="scanner-frame">
            <div className="corner tl" />
            <div className="corner tr" />
            <div className="corner bl" />
            <div className="corner br" />

            {!cameraStarted ? (
              <div className="scanner-placeholder">
                <div className="scan-circle">
                  <Camera size={32} />
                </div>
                <strong>Camera scanner</strong>
                <span>Ready to scan</span>

                <button
                  className="btn btn-primary"
                  onClick={() => setCameraStarted(true)}
                >
                  <Camera size={16} />
                  Start Camera
                </button>
              </div>
            ) : (
              <div className="camera-placeholder">
                <Camera size={35} />
                <strong>Camera integration ready</strong>
                <span>
                  Connect the QR library here for live scanning.
                </span>
              </div>
            )}
          </div>

          <div className="manual-section">
            <div className="manual-title">
              <Keyboard size={16} />
              Or enter Batch ID manually
            </div>

            <div className="manual-row">
              <input
                className="input"
                placeholder="e.g. PC-PCM-24001"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
              />

              <button className="btn btn-primary" onClick={verifyManual}>
                Verify <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>

        <section className="clay-card scanner-info">
          <div className="info-shield">
            <ShieldCheck size={30} />
          </div>

          <h2>Trust, before you take it.</h2>
          <p>
            A scan connects the package to its registered batch record,
            allowing authorized users to inspect its supply-chain history.
          </p>

          <div className="scanner-points">
            <div>
              <span>01</span>
              <strong>Scan</strong>
              <p>Read the package identifier.</p>
            </div>

            <div>
              <span>02</span>
              <strong>Verify</strong>
              <p>Check the registered batch.</p>
            </div>

            <div>
              <span>03</span>
              <strong>Trace</strong>
              <p>Review custody and lifecycle.</p>
            </div>
          </div>

          <Link className="btn btn-secondary" to="/verify">
            Open Verification
          </Link>
        </section>
      </div>

      <style>{`
        .scanner-layout {
          display: grid;
          grid-template-columns: 1.15fr .85fr;
          gap: 22px;
        }

        .scanner-card,
        .scanner-info {
          padding: 28px;
        }

        .scanner-header {
          display: flex;
          gap: 13px;
          align-items: center;
        }

        .scanner-icon,
        .info-shield {
          width: 50px;
          height: 50px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: #e5eee9;
          color: var(--green);
        }

        .scanner-header h2 {
          margin: 0 0 4px;
          font-size: 18px;
        }

        .scanner-header p {
          margin: 0;
          color: var(--muted);
          font-size: 11px;
        }

        .scanner-frame {
          height: 370px;
          margin-top: 25px;
          border-radius: 23px;
          background: #e9e9e3;
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
          box-shadow:
            inset 7px 7px 18px rgba(54,59,55,.08),
            inset -7px -7px 18px rgba(255,255,255,.8);
        }

        .scanner-placeholder,
        .camera-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          color: var(--muted);
        }

        .scanner-placeholder strong,
        .camera-placeholder strong {
          color: var(--ink);
          margin-top: 5px;
          font-size: 14px;
        }

        .scanner-placeholder span,
        .camera-placeholder span {
          font-size: 10px;
          margin-bottom: 12px;
        }

        .scan-circle {
          width: 75px;
          height: 75px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: var(--green);
          background: var(--surface);
          box-shadow: var(--shadow);
        }

        .corner {
          width: 38px;
          height: 38px;
          position: absolute;
          border-color: var(--green);
        }

        .tl {
          top: 25px;
          left: 25px;
          border-top: 3px solid;
          border-left: 3px solid;
          border-radius: 9px 0 0 0;
        }

        .tr {
          top: 25px;
          right: 25px;
          border-top: 3px solid;
          border-right: 3px solid;
          border-radius: 0 9px 0 0;
        }

        .bl {
          bottom: 25px;
          left: 25px;
          border-bottom: 3px solid;
          border-left: 3px solid;
          border-radius: 0 0 0 9px;
        }

        .br {
          bottom: 25px;
          right: 25px;
          border-bottom: 3px solid;
          border-right: 3px solid;
          border-radius: 0 0 9px 0;
        }

        .manual-section {
          margin-top: 23px;
        }

        .manual-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 9px;
        }

        .manual-row {
          display: flex;
          gap: 9px;
        }

        .manual-row .input {
          flex: 1;
        }

        .info-shield {
          width: 62px;
          height: 62px;
        }

        .scanner-info h2 {
          font-size: 21px;
          margin: 20px 0 8px;
        }

        .scanner-info > p {
          color: var(--muted);
          line-height: 1.7;
          font-size: 12px;
        }

        .scanner-points {
          display: grid;
          gap: 10px;
          margin: 25px 0;
        }

        .scanner-points div {
          padding: 13px;
          border-radius: 15px;
          background: #f2f2ed;
          display: grid;
          grid-template-columns: 28px 1fr;
          column-gap: 9px;
        }

        .scanner-points span {
          color: var(--gold);
          font-weight: 800;
          font-size: 10px;
        }

        .scanner-points strong {
          font-size: 12px;
        }

        .scanner-points p {
          grid-column: 2;
          margin: 3px 0 0;
          color: var(--muted);
          font-size: 10px;
        }

        @media(max-width:850px) {
          .scanner-layout {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width:550px) {
          .manual-row {
            flex-direction: column;
          }
        }
      `}</style>
    </AppShell>
  );
}
