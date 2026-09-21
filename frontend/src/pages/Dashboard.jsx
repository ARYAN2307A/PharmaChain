import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Boxes,
  Truck,
  ShieldCheck,
  Plus,
  QrCode,
  ArrowUpRight,
  CheckCircle2,
  Activity,
  AlertTriangle,
  ChevronRight,
  Database,
  RefreshCw
} from "lucide-react";

import "./Dashboard.css";
import { getMedicines } from "../services/medicineService";
import { getBatches } from "../services/batchService";
import { getTransfers } from "../services/transferService";

function Dashboard() {
  const role = localStorage.getItem("role") || "MANUFACTURER";

  const [stats, setStats] = useState([
    { title: "Total Medicines", value: "0", change: "Tracking", icon: Package, type: "green" },
    { title: "Active Batches", value: "0", change: "In network", icon: Boxes, type: "gold" },
    { title: "In Transit", value: "0", change: "Moving", icon: Truck, type: "sage" },
    { title: "Recalled", value: "0", change: "Requires attention", icon: AlertTriangle, type: "red" }
  ]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    Promise.all([
      getMedicines().catch(() => []),
      getBatches().catch(() => []),
      getTransfers().catch(() => [])
    ]).then(([medsData, batchesData, transfersData]) => {
      const meds = Array.isArray(medsData) ? medsData : medsData?.medicines || [];
      const batches = Array.isArray(batchesData) ? batchesData : batchesData?.batches || [];
      const transfers = Array.isArray(transfersData) ? transfersData : transfersData?.transfers || [];
      
      setStats([
        { title: "Total Medicines", value: meds.length.toString(), change: "Tracking", icon: Package, type: "green" },
        { title: "Total Batches", value: batches.length.toString(), change: "In network", icon: Boxes, type: "gold" },
        { title: "In Transit", value: batches.filter(b => b.status === "IN_TRANSIT" || b.lifecycleState === "IN_TRANSIT").length.toString(), change: "Moving", icon: Truck, type: "sage" },
        { title: "Recalled", value: batches.filter(b => b.status === "RECALLED").length.toString(), change: "Requires attention", icon: AlertTriangle, type: "red" }
      ]);

      const recentTransfers = transfers.slice(-4).reverse().map(t => ({
        batch: t.batch?.batchNumber || t.batch,
        medicine: t.batch?.medicine?.name || "Medicine",
        action: t.status === "COMPLETED" ? "Receipt confirmed" : "Ownership transferred",
        from: t.from?.name || "Sender",
        to: t.to?.name || "Receiver",
        time: new Date(t.createdAt).toLocaleDateString(),
        status: t.status === "COMPLETED" ? "Verified" : "In Transit"
      }));
      setActivities(recentTransfers);
    });
  }, []);

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>
          <div className="dashboard-kicker">
            PHARMACHAIN / DASHBOARD
          </div>

          <h1>
            Good evening.
            <br />
            <span>Here's your supply chain.</span>
          </h1>

          <p>
            Monitor medicine batches, custody transfers and verification
            activity from one place.
          </p>
        </div>

        <div className="dashboard-actions">

          <Link to="/scan" className="dashboard-soft-button">
            <QrCode size={17} />
            Scan Medicine
          </Link>

          <Link to="/batches/create" className="dashboard-primary-button">
            <Plus size={17} />
            Create Batch
          </Link>

        </div>

      </div>

      {/* ROLE */}

      <div className="role-banner">

        <div className="role-left">

          <div className="role-icon">
            <ShieldCheck size={21} />
          </div>

          <div>
            <span>YOUR ROLE</span>
            <strong>{role.replace("_", " ")}</strong>
          </div>

        </div>

        <div className="role-status">
          <span />
          Blockchain connection active
        </div>

      </div>

      {/* STATS */}

      <div className="stats-grid">

        {stats.map((stat) => {

          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.title}>

              <div className={`stat-icon ${stat.type}`}>
                <Icon size={21} />
              </div>

              <div className="stat-info">

                <span>{stat.title}</span>

                <strong>{stat.value}</strong>

                <small className={stat.type === "red" ? "warning" : ""}>
                  {stat.change}
                </small>

              </div>

              <ArrowUpRight className="stat-arrow" size={18} />

            </div>
          );
        })}

      </div>

      {/* MAIN GRID */}

      <div className="dashboard-main-grid">

        {/* ACTIVITY */}

        <section className="dashboard-panel activity-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">RECENT ACTIVITY</span>
              <h2>Supply chain activity</h2>
            </div>

            <Link to="/batches">
              View all
              <ChevronRight size={15} />
            </Link>

          </div>

          <div className="activity-list">

            {activities.map((item) => (

              <div className="activity-item" key={item.batch}>

                <div className="activity-icon">
                  <Activity size={17} />
                </div>

                <div className="activity-content">

                  <div className="activity-top">

                    <strong>{item.action}</strong>

                    <span className={
                      item.status === "In Transit"
                        ? "activity-status transit"
                        : "activity-status"
                    }>
                      {item.status === "Verified" && (
                        <CheckCircle2 size={12} />
                      )}

                      {item.status === "In Transit" && (
                        <Truck size={12} />
                      )}

                      {item.status}
                    </span>

                  </div>

                  <p>
                    <b>{item.medicine}</b>
                    {" Â· "}
                    {item.batch}
                  </p>

                  <small>
                    {item.from}
                    {item.to !== "â€”" && ` ? ${item.to}`}
                    {" Â· "}
                    {item.time}
                  </small>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* BLOCKCHAIN */}

        <section className="dashboard-panel blockchain-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">BLOCKCHAIN</span>
              <h2>Network status</h2>
            </div>

            <div className="live-dot">
              <span />
              LIVE
            </div>

          </div>

          <div className="blockchain-visual">

            <div className="blockchain-core">
              <Database size={28} />
            </div>

            <div className="blockchain-ring ring-a" />
            <div className="blockchain-ring ring-b" />

          </div>

          <div className="blockchain-status">

            <div>
              <span>Network</span>
              <strong>Local Hardhat Network</strong>
            </div>

            <div>
              <span>Contract</span>
              <strong className="contract-address">
                0x5FbDB...180aa3
              </strong>
            </div>

            <div>
              <span>Verification</span>
              <strong className="verified-text">
                <CheckCircle2 size={14} />
                Operational
              </strong>
            </div>

          </div>

          <Link to="/verify" className="blockchain-button">
            Open Blockchain Verification
            <ArrowUpRight size={15} />
          </Link>

        </section>

      </div>

      {/* QUICK ACTIONS */}

      <section className="quick-section">

        <div className="panel-header">

          <div>
            <span className="panel-kicker">QUICK ACTIONS</span>
            <h2>What do you want to do?</h2>
          </div>

        </div>

        <div className="quick-grid">

          <Link to="/batches/create" className="quick-card">

            <div className="quick-icon green">
              <Plus size={22} />
            </div>

            <div>
              <strong>Create a batch</strong>
              <span>Register a new medicine batch</span>
            </div>

            <ChevronRight size={18} />

          </Link>

          <Link to="/scan" className="quick-card">

            <div className="quick-icon gold">
              <QrCode size={22} />
            </div>

            <div>
              <strong>Verify medicine</strong>
              <span>Scan and verify a package</span>
            </div>

            <ChevronRight size={18} />

          </Link>

          <Link to="/transfers" className="quick-card">

            <div className="quick-icon sage">
              <Truck size={22} />
            </div>

            <div>
              <strong>Manage transfers</strong>
              <span>View custody handovers</span>
            </div>

            <ChevronRight size={18} />

          </Link>

          <Link to="/medicines" className="quick-card">

            <div className="quick-icon dark">
              <Package size={22} />
            </div>

            <div>
              <strong>Medicine library</strong>
              <span>Browse registered medicines</span>
            </div>

            <ChevronRight size={18} />

          </Link>

        </div>

      </section>

      {/* FOOTER INFO */}

      <div className="dashboard-footer">

        <span>
          PharmaChain Â· Track Â· Verify Â· Trust
        </span>

        <span>
          <RefreshCw size={12} />
          Data refreshes automatically
        </span>

      </div>

    </div>
  );
}

export default Dashboard;
