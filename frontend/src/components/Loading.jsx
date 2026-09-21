import { LoaderCircle } from "lucide-react";

export default function Loading({ text = "Loading..." }) {
  return (
    <div className="loading-state">
      <LoaderCircle size={28} className="spin" />
      <span>{text}</span>

      <style>{`
        .loading-state {
          min-height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #7c8580;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
