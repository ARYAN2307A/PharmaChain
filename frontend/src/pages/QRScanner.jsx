import { useRef, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ScanLine,
  Camera,
  ShieldCheck,
  Keyboard,
  ArrowRight,
  Upload,
  VideoOff,
  Loader2,
  CheckCircle2
} from "lucide-react";
import AppShell from "../components/AppShell";

export default function QRScanner() {
  const navigate = useNavigate();
  const [manual, setManual] = useState("");
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraLoading, setCameraLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  // ─── Parse batch from QR text / URL ───────────────────────────────────────
  const processBatchText = (text) => {
    if (!text) return;
    let batchParam = text.trim();
    if (batchParam.includes("batch=")) {
      try {
        const urlObj = new URL(batchParam.startsWith("http") ? batchParam : `http://dummy.com?${batchParam.split("?").pop()}`);
        batchParam = urlObj.searchParams.get("batch") || batchParam;
      } catch {
        const match = batchParam.match(/batch=([^&]+)/);
        if (match) batchParam = match[1];
      }
    }
    setScanResult(batchParam);
    setTimeout(() => navigate(`/verify?batch=${encodeURIComponent(batchParam)}`), 800);
  };

  // ─── QR frame scanning via jsQR ───────────────────────────────────────────
  const scanFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const jsQR = (await import("jsqr")).default;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data) {
        processBatchText(code.data);
        stopCamera();
      }
    } catch {
      // jsQR not loaded yet — skip frame
    }
  }, []);

  // ─── KEY FIX: Assign srcObject via useEffect after video renders ──────────
  useEffect(() => {
    if (cameraStarted && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});

      // Start QR frame scanning every 300ms
      scanIntervalRef.current = setInterval(scanFrame, 300);
    }
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [cameraStarted, scanFrame]);

  // ─── Start camera ─────────────────────────────────────────────────────────
  const startCamera = async () => {
    setCameraError("");
    setCameraLoading(true);
    setScanResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setCameraStarted(true); // triggers useEffect above which assigns srcObject
    } catch (err) {
      const msg = err.name === "NotAllowedError"
        ? "Camera permission denied. Please allow camera access in your browser settings."
        : err.name === "NotFoundError"
        ? "No camera device found on this computer."
        : "Camera unavailable. Try a different browser or use file upload / manual entry.";
      setCameraError(msg);
    } finally {
      setCameraLoading(false);
    }
  };

  // ─── Stop camera ──────────────────────────────────────────────────────────
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStarted(false);
  };

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), []);

  // ─── File upload: try jsQR decode, fallback to filename extraction ─────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        try {
          const jsQR = (await import("jsqr")).default;
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            processBatchText(code.data);
          } else {
            // fallback: parse filename like QR_PC-PCM-24001.png
            const match = file.name.match(/QR_(.+)\.(png|jpg|jpeg)/i);
            if (match) {
              processBatchText(match[1]);
            } else {
              setCameraError("No QR code detected in the image. Try a clearer photo or use manual entry.");
            }
          }
        } catch {
          setCameraError("Could not decode the image. Try manual entry instead.");
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch {
      setCameraError("Failed to load the image file.");
    }
    // reset so same file can be re-uploaded
    e.target.value = "";
  };

  const verifyManual = () => {
    if (!manual.trim()) return;
    processBatchText(manual.trim());
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
              <p>Camera access or QR file upload to verify batch provenance.</p>
            </div>
          </div>

          {/* Camera Frame */}
          <div className="scanner-frame">
            <div className="corner tl" />
            <div className="corner tr" />
            <div className="corner bl" />
            <div className="corner br" />

            {/* Hidden canvas for jsQR decoding */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Scan success flash */}
            {scanResult && (
              <div className="scan-success">
                <CheckCircle2 size={38} />
                <strong>QR Detected!</strong>
                <span>{scanResult}</span>
                <p>Redirecting to verification…</p>
              </div>
            )}

            {/* Camera video — always rendered when started so ref is available */}
            {cameraStarted && !scanResult && (
              <div style={{ width: "100%", height: "100%", position: "relative" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "23px",
                    display: "block",
                    background: "#000"
                  }}
                />
                {/* Animated scan line */}
                <div className="scan-line-anim" />
                <button
                  className="btn btn-secondary"
                  onClick={stopCamera}
                  style={{
                    position: "absolute",
                    bottom: "15px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 10,
                    fontSize: "12px",
                    padding: "8px 14px"
                  }}
                >
                  <VideoOff size={14} /> Stop Camera
                </button>
              </div>
            )}

            {/* Placeholder shown when camera is off and no scan result */}
            {!cameraStarted && !scanResult && (
              <div className="scanner-placeholder">
                <div className="scan-circle">
                  {cameraLoading ? <Loader2 size={32} className="spin" /> : <Camera size={32} />}
                </div>
                <strong>{cameraLoading ? "Starting camera…" : "Camera & File Scanner"}</strong>
                {!cameraLoading && <span>Ready to scan package</span>}

                {!cameraLoading && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                    <button className="btn btn-primary" onClick={startCamera}>
                      <Camera size={16} />
                      Start Camera
                    </button>

                    <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                      <Upload size={16} />
                      Upload QR Image
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                  </div>
                )}

                {cameraError && (
                  <p style={{ color: "var(--red)", fontSize: "11px", marginTop: "12px", textAlign: "center", maxWidth: "320px" }}>
                    {cameraError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Manual entry */}
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
                onKeyDown={(e) => e.key === "Enter" && verifyManual()}
              />
              <button className="btn btn-primary" onClick={verifyManual}>
                Verify <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* Info panel */}
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }

        @keyframes scanLine {
          0%   { top: 10%; }
          50%  { top: 85%; }
          100% { top: 10%; }
        }

        .scan-line-anim {
          position: absolute;
          left: 8%;
          right: 8%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--green), transparent);
          border-radius: 2px;
          animation: scanLine 2.2s ease-in-out infinite;
          z-index: 5;
          pointer-events: none;
        }

        .scan-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--green);
          text-align: center;
        }
        .scan-success strong { font-size: 16px; color: var(--ink); }
        .scan-success span  { font-size: 12px; color: var(--ink); background: #e5eee9; padding: 4px 10px; border-radius: 8px; }
        .scan-success p     { font-size: 11px; color: var(--muted); margin: 0; }

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
          flex-shrink: 0;
        }

        .scanner-header h2 { margin: 0 0 4px; font-size: 18px; }
        .scanner-header p  { margin: 0; color: var(--muted); font-size: 11px; }

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

        .scanner-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          color: var(--muted);
          padding: 20px;
          text-align: center;
        }

        .scanner-placeholder strong { color: var(--ink); margin-top: 5px; font-size: 14px; }
        .scanner-placeholder span   { font-size: 10px; margin-bottom: 12px; }

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
          z-index: 10;
          pointer-events: none;
        }
        .tl { top: 25px;    left: 25px;  border-top: 3px solid; border-left: 3px solid;  border-radius: 9px 0 0 0; }
        .tr { top: 25px;    right: 25px; border-top: 3px solid; border-right: 3px solid; border-radius: 0 9px 0 0; }
        .bl { bottom: 25px; left: 25px;  border-bottom: 3px solid; border-left: 3px solid;  border-radius: 0 0 0 9px; }
        .br { bottom: 25px; right: 25px; border-bottom: 3px solid; border-right: 3px solid; border-radius: 0 0 9px 0; }

        .manual-section { margin-top: 23px; }
        .manual-title {
          display: flex; align-items: center;
          gap: 7px; font-size: 11px; font-weight: 800; margin-bottom: 9px;
        }
        .manual-row { display: flex; gap: 9px; }
        .manual-row .input { flex: 1; }

        .info-shield { width: 62px; height: 62px; }
        .scanner-info h2   { font-size: 21px; margin: 20px 0 8px; }
        .scanner-info > p  { color: var(--muted); line-height: 1.7; font-size: 12px; }

        .scanner-points { display: grid; gap: 10px; margin: 25px 0; }
        .scanner-points div {
          padding: 13px; border-radius: 15px; background: #f2f2ed;
          display: grid; grid-template-columns: 28px 1fr; column-gap: 9px;
        }
        .scanner-points span   { color: var(--gold); font-weight: 800; font-size: 10px; }
        .scanner-points strong { font-size: 12px; }
        .scanner-points p      { grid-column: 2; margin: 3px 0 0; color: var(--muted); font-size: 10px; }

        @media(max-width:850px) {
          .scanner-layout { grid-template-columns: 1fr; }
        }
        @media(max-width:550px) {
          .manual-row { flex-direction: column; }
        }
      `}</style>
    </AppShell>
  );
}
