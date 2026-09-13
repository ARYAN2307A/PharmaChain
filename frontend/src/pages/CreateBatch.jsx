import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PackagePlus, Save } from "lucide-react";
import AppShell from "../components/AppShell";
import { createBatch } from "../services/batchService";

export default function CreateBatch() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    batchNumber: "",
    medicineId: "",
    quantity: "",
    manufactureDate: "",
    expiryDate: "",
    storageConditions: ""
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await createBatch(form);
      navigate("/batches");
    } catch {
      setError(
        "Backend connection unavailable. Batch was not registered."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <button className="back-link" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back
          </button>
          <h1>Create Batch</h1>
          <p>Register a traceable medicine batch.</p>
        </div>
      </div>

      <form className="clay-card batch-form" onSubmit={submit}>
        <div className="form-heading">
          <div className="form-heading-icon">
            <PackagePlus size={23} />
          </div>
          <div>
            <h2>Batch information</h2>
            <p>Batch identity and manufacturing details.</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Batch Number *</label>
            <input
              required
              className="input"
              value={form.batchNumber}
              onChange={(e) => update("batchNumber", e.target.value)}
              placeholder="e.g. PC-PCM-24001"
            />
          </div>

          <div className="form-group">
            <label>Medicine ID *</label>
            <input
              required
              className="input"
              value={form.medicineId}
              onChange={(e) => update("medicineId", e.target.value)}
              placeholder="Medicine ID"
            />
          </div>

          <div className="form-group">
            <label>Quantity *</label>
            <input
              required
              type="number"
              min="1"
              className="input"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              placeholder="Number of units"
            />
          </div>

          <div className="form-group">
            <label>Manufacture Date *</label>
            <input
              required
              type="date"
              className="input"
              value={form.manufactureDate}
              onChange={(e) => update("manufactureDate", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Expiry Date *</label>
            <input
              required
              type="date"
              className="input"
              value={form.expiryDate}
              onChange={(e) => update("expiryDate", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Storage Conditions</label>
            <input
              className="input"
              value={form.storageConditions}
              onChange={(e) => update("storageConditions", e.target.value)}
              placeholder="e.g. 15–25°C"
            />
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/batches")}
          >
            Cancel
          </button>

          <button className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            {saving ? "Registering..." : "Register Batch"}
          </button>
        </div>
      </form>

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

        .batch-form {
          padding: 30px;
        }

        .form-heading {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 30px;
        }

        .form-heading-icon {
          width: 50px;
          height: 50px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: #e5eee9;
          color: var(--green);
        }

        .form-heading h2 {
          margin: 0 0 4px;
          font-size: 18px;
        }

        .form-heading p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 28px;
        }

        .form-error {
          margin-top: 20px;
          padding: 12px 14px;
          border-radius: 12px;
          background: #fff0ef;
          color: #c94743;
          font-size: 12px;
        }
      `}</style>
    </AppShell>
  );
}
