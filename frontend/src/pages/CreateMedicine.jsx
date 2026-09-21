import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pill, Save } from "lucide-react";
import AppShell from "../components/AppShell";
import { createMedicine } from "../services/medicineService";

export default function CreateMedicine() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    genericName: "",
    category: "",
    manufacturer: "",
    dosage: "",
    description: ""
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await createMedicine(form);
      navigate("/medicines");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to register medicine. Please check required fields.";
      setMessage(msg);
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
          <h1>Create Medicine</h1>
          <p>Register a medicine in the PharmaChain system.</p>
        </div>
      </div>

      <form className="clay-card create-form" onSubmit={submit}>
        <div className="form-heading">
          <div className="form-heading-icon">
            <Pill size={23} />
          </div>
          <div>
            <h2>Medicine information</h2>
            <p>Basic off-chain medicine metadata.</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Medicine Name *</label>
            <input
              required
              className="input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Paracetamol 500mg"
            />
          </div>

          <div className="form-group">
            <label>Generic Name</label>
            <input
              className="input"
              value={form.genericName}
              onChange={(e) => update("genericName", e.target.value)}
              placeholder="e.g. Paracetamol"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              className="input"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="e.g. Analgesic"
            />
          </div>

          <div className="form-group">
            <label>Manufacturer</label>
            <input
              className="input"
              value={form.manufacturer}
              onChange={(e) => update("manufacturer", e.target.value)}
              placeholder="Manufacturer name"
            />
          </div>

          <div className="form-group">
            <label>Dosage</label>
            <input
              className="input"
              value={form.dosage}
              onChange={(e) => update("dosage", e.target.value)}
              placeholder="e.g. 500 mg"
            />
          </div>

          <div className="form-group full">
            <label>Description</label>
            <textarea
              className="textarea"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Medicine description..."
            />
          </div>
        </div>

        {message && <div className="form-error">{message}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/medicines")}
          >
            Cancel
          </button>

          <button disabled={saving} className="btn btn-primary">
            <Save size={16} />
            {saving ? "Saving..." : "Register Medicine"}
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

        .create-form {
          padding: 30px;
        }

        .form-heading {
          display: flex;
          gap: 14px;
          align-items: center;
          margin-bottom: 30px;
        }

        .form-heading-icon {
          width: 50px;
          height: 50px;
          display: grid;
          place-items: center;
          color: var(--green);
          background: #e5eee9;
          border-radius: 16px;
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
          margin-top: 28px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
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
