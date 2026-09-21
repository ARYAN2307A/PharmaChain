import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Pill,
  Package,
  ArrowLeftRight,
  ScanLine,
  BadgeCheck,
  UserRound,
  LogOut,
  ShieldCheck,
  PlusCircle
} from "lucide-react";
import { getRole, logout } from "../utils/auth";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/medicines", label: "Medicines", icon: Pill },
  { to: "/batches", label: "Batches", icon: Package },
  { to: "/transfers", label: "Transfers", icon: ArrowLeftRight },
  { to: "/scan", label: "QR Scanner", icon: ScanLine },
  { to: "/verify", label: "Verification", icon: BadgeCheck },
  { to: "/profile", label: "Profile", icon: UserRound }
];

export default function Sidebar() {
  const navigate = useNavigate();
  const role = getRole() || "USER";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <ShieldCheck size={22} />
        </div>
        <div>
          <strong>PharmaChain</strong>
          <span>Trusted medicine network</span>
        </div>
      </div>

      <div className="role-pill">{role}</div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="create-mini"
          onClick={() => navigate("/batches/create")}
        >
          <PlusCircle size={17} />
          Create Batch
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={17} />
          Sign out
        </button>
      </div>

      <style>{`
        .sidebar {
          width: 250px;
          min-height: 100vh;
          padding: 24px 16px;
          background: var(--surface);
          box-shadow: 8px 0 25px rgba(54,59,55,.06);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .brand {
          display: flex;
          gap: 11px;
          align-items: center;
          padding: 7px 8px 20px;
        }

        .brand-mark {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: white;
          background: var(--green);
          box-shadow: 5px 5px 12px rgba(49,92,82,.22);
        }

        .brand strong {
          display: block;
          font-family: "Plus Jakarta Sans";
          font-size: 16px;
        }

        .brand span {
          display: block;
          color: var(--muted);
          font-size: 10px;
          margin-top: 3px;
        }

        .role-pill {
          margin: 2px 8px 18px;
          background: #e6eee9;
          color: var(--green);
          border-radius: 999px;
          padding: 7px 11px;
          width: fit-content;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .5px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .side-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 13px;
          border-radius: 14px;
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
          transition: .2s ease;
        }

        .side-link:hover {
          color: var(--green);
          transform: translateX(3px);
          background: #f2f2ed;
        }

        .side-link.active {
          color: var(--green);
          background: #e6eee9;
          box-shadow: inset 3px 3px 8px rgba(49,92,82,.06);
        }

        .sidebar-bottom {
          margin-top: auto;
          display: grid;
          gap: 10px;
        }

        .create-mini,
        .logout-btn {
          border: 0;
          border-radius: 14px;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
        }

        .create-mini {
          background: var(--green);
          color: white;
        }

        .logout-btn {
          color: var(--muted);
          background: transparent;
        }

        @media(max-width: 800px) {
          .sidebar {
            width: 76px;
            padding: 18px 10px;
          }

          .brand > div:last-child,
          .role-pill,
          .side-link span,
          .create-mini,
          .logout-btn {
            display: none;
          }

          .brand {
            justify-content: center;
          }

          .side-link {
            justify-content: center;
          }
        }
      `}</style>
    </aside>
  );
}
