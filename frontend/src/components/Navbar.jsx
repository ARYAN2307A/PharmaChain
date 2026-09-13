import { Bell, Search } from "lucide-react";
import { getRole } from "../utils/auth";

export default function Navbar() {
  return (
    <header className="app-navbar">
      <div className="nav-search">
        <Search size={17} />
        <input placeholder="Search medicines, batches..." />
      </div>

      <div className="nav-right">
        <button className="icon-btn">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        <div className="user-chip">
          <div className="avatar">
            {(getRole() || "U").charAt(0)}
          </div>
          <div>
            <strong>Supply Chain User</strong>
            <span>{getRole() || "USER"}</span>
          </div>
        </div>
      </div>

      <style>{`
        .app-navbar {
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .nav-search {
          width: min(420px, 55%);
          position: relative;
        }

        .nav-search svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
        }

        .nav-search input {
          width: 100%;
          border: 0;
          outline: 0;
          border-radius: 15px;
          background: var(--surface);
          padding: 13px 15px 13px 42px;
          color: var(--ink);
          box-shadow: var(--soft-shadow);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-btn {
          border: 0;
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: var(--surface);
          color: var(--ink);
          box-shadow: var(--soft-shadow);
          position: relative;
        }

        .notification-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--red);
          position: absolute;
          top: 9px;
          right: 9px;
        }

        .user-chip {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .avatar {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: white;
          background: var(--green);
          font-weight: 800;
        }

        .user-chip strong {
          display: block;
          font-size: 12px;
        }

        .user-chip span {
          display: block;
          color: var(--muted);
          font-size: 10px;
          margin-top: 2px;
        }

        @media(max-width:600px) {
          .user-chip > div:last-child {
            display: none;
          }

          .nav-search {
            width: 60%;
          }
        }
      `}</style>
    </header>
  );
}
