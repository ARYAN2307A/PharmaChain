import { UserRound, ShieldCheck, Mail, Building2, KeyRound } from "lucide-react";
import AppShell from "../components/AppShell";
import { getRole } from "../utils/auth";

export default function Profile() {
  const role = getRole() || "MANUFACTURER";

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p>Your PharmaChain account and access information.</p>
        </div>
      </div>

      <div className="profile-layout">
        <section className="clay-card profile-card">
          <div className="profile-avatar">
            <UserRound size={35} />
          </div>

          <h2>Supply Chain User</h2>
          <span className="profile-role">{role}</span>

          <div className="profile-fields">
            <div>
              <Mail size={16} />
              <span>Email</span>
              <strong>user@pharmachain.local</strong>
            </div>

            <div>
              <Building2 size={16} />
              <span>Organization</span>
              <strong>PharmaChain Network</strong>
            </div>

            <div>
              <ShieldCheck size={16} />
              <span>Role</span>
              <strong>{role}</strong>
            </div>
          </div>
        </section>

        <section className="clay-card security-card">
          <div className="security-icon">
            <KeyRound size={23} />
          </div>

          <h2>Security & Access</h2>
          <p>
            Your account controls which supply-chain operations you are
            authorized to perform.
          </p>

          <div className="security-item">
            <span>Authentication</span>
            <strong>Protected</strong>
          </div>

          <div className="security-item">
            <span>Role authorization</span>
            <strong>{role}</strong>
          </div>

          <div className="security-item">
            <span>Blockchain identity</span>
            <strong>Connected (Local Network)</strong>
          </div>
        </section>
      </div>

      <style>{`
        .profile-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }

        .profile-card,
        .security-card {
          padding: 30px;
        }

        .profile-avatar {
          width: 78px;
          height: 78px;
          border-radius: 25px;
          display: grid;
          place-items: center;
          color: white;
          background: var(--green);
          box-shadow: 7px 7px 16px rgba(49,92,82,.2);
        }

        .profile-card h2 {
          margin: 20px 0 6px;
          font-size: 21px;
        }

        .profile-role {
          color: var(--green);
          background: #e5eee9;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
        }

        .profile-fields {
          display: grid;
          gap: 11px;
          margin-top: 28px;
        }

        .profile-fields div {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 3px 9px;
          padding: 13px;
          border-radius: 14px;
          background: #f2f2ed;
          color: var(--green);
        }

        .profile-fields span {
          color: var(--muted);
          font-size: 9px;
        }

        .profile-fields strong {
          grid-column: 2;
          color: var(--ink);
          font-size: 11px;
        }

        .security-icon {
          width: 53px;
          height: 53px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          color: var(--green);
          background: #e5eee9;
        }

        .security-card h2 {
          margin: 19px 0 7px;
          font-size: 19px;
        }

        .security-card > p {
          color: var(--muted);
          line-height: 1.7;
          font-size: 11px;
        }

        .security-item {
          display: flex;
          justify-content: space-between;
          padding: 14px;
          margin-top: 10px;
          border-radius: 14px;
          background: #f2f2ed;
        }

        .security-item span {
          color: var(--muted);
          font-size: 10px;
        }

        .security-item strong {
          font-size: 10px;
        }

        @media(max-width:750px) {
          .profile-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppShell>
  );
}
