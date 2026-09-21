import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Landing.css";

const journey = [
  ["Manufacturer", "Create batch", "green"],
  ["Distributor", "Receive & transfer", "gold"],
  ["Warehouse", "Store safely", "green"],
  ["Pharmacy", "Dispense", "gold"],
  ["Consumer", "Verify", "red"],
];

const features = [
  ["?", "QR-Based Verification", "Scan a package and retrieve its verified medicine identity and current status."],
  ["?", "Proof of Handover", "Custody changes are validated before the next authorized party can continue the journey."],
  ["?", "Medicine Passport", "See origin, batch identity, lifecycle, custody journey, and blockchain proof in one place."],
  ["!", "Recall & Expiry", "Surface critical warnings when a batch is recalled, suspended, or expired."],
];

function Landing() {
  const navigate = useNavigate();
  const [active, setActive] = useState("home");
  const [scattering, setScattering] = useState(false);

  useEffect(() => {
    const sections = ["home", "journey", "verify", "proof", "features"];

    const handleScroll = () => {
      const y = window.scrollY + 180;

      let current = "home";

      sections.forEach((id) => {
        const section = document.getElementById(id);
        if (section && section.offsetTop <= y) {
          current = id;
        }
      });

      setActive(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleVerify = () => {
    setScattering(true);

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="landing">

      {/* FLOATING BACKGROUND */}
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />
      <div className="floating-orb orb-4" />
      <div className="floating-orb orb-5" />
      <div className="floating-orb orb-6" />

      {/* NAVBAR */}
      <nav className="landing-nav">
        <Link to="/" className="landing-logo">
          <div className="logo-mark">?</div>

          <div>
            <strong>PharmaChain</strong>
            <small>TRACK â€¢ VERIFY â€¢ TRUST</small>
          </div>
        </Link>

        <div className="landing-links">
          <button
            className={active === "home" ? "active" : ""}
            onClick={() => scrollTo("home")}
          >
            Home
          </button>

          <button
            className={active === "journey" ? "active" : ""}
            onClick={() => scrollTo("journey")}
          >
            How It Works
          </button>

          <button
            className={active === "features" ? "active" : ""}
            onClick={() => scrollTo("features")}
          >
            Features
          </button>

          <button
            className={active === "proof" ? "active" : ""}
            onClick={() => scrollTo("proof")}
          >
            Blockchain
          </button>
        </div>

        <div className="nav-actions">
          <button
            className="soft-btn"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>

          <button
            className="green-btn"
            onClick={() => navigate("/register")}
          >
            Get started
          </button>
        </div>
      </nav>

      <main>

        {/* HERO */}
        <section id="home" className="hero-section landing-container">

          <div className="hero-copy">

            <div className="eyebrow">
              <span />
              TRUSTED MEDICINE INFRASTRUCTURE
            </div>

            <h1>
              <span>Real Medicine.</span>
              <span className="hero-accent">Real Trust.</span>
            </h1>

            <p>
              Every medicine has a journey. PharmaChain makes that journey
              visible, verifiable, and backed by blockchain proof â€” from
              manufacturer to patient.
            </p>

            <div className="hero-buttons">
              <button
                className="green-btn large"
                onClick={handleVerify}
              >
                Verify Medicine ?
              </button>

              <button
                className="soft-btn large"
                onClick={() => scrollTo("journey")}
              >
                Explore the chain
              </button>
            </div>

            <div className="hero-note">
              <b>?</b> Blockchain-backed provenance Â· QR verification Â·
              custody proof
            </div>

          </div>

          <div className="hero-stage">

            <div className="route-line">
              <svg viewBox="0 0 560 300">
                <path
                  d="M35 235 C125 230 90 120 205 140 C300 158 250 42 355 70 C430 90 420 175 530 100"
                />
                <circle cx="35" cy="235" r="8" />
                <circle cx="205" cy="140" r="8" />
                <circle cx="355" cy="70" r="8" />
                <circle cx="530" cy="100" r="8" />
              </svg>
            </div>

            <div className="hero-orb hero-orb-one" />
            <div className="hero-orb hero-orb-two" />

            <div className="medicine-package">

              <div className="package-top">
                <span>PHARMACHAIN</span>
                <div className="pill-shape" />
              </div>

              <h3>
                AMOXICARE
                <br />
                500mg
              </h3>

              <p>Verified pharmaceutical batch</p>

              <div className="mini-qr">
                <div className="qr-pattern" />
              </div>

              <div className="batch-number">
                BATCH ID
                <strong>PC-2026-004821</strong>
              </div>

            </div>

            <div className="floating-proof verification-card">
              <div className="check-icon">?</div>
              <div>
                <strong>AUTHENTIC BATCH</strong>
                <span>4 verified handovers Â· In transit</span>
              </div>
            </div>

            <div className="floating-proof ownership-card">
              <small>BLOCKCHAIN PROOF</small>
              <strong>Ownership verified</strong>
              <span>TX Â· 0x83A...29F</span>
            </div>

          </div>

        </section>

        {/* JOURNEY */}
        <section id="journey" className="landing-section landing-container">

          <div className="section-head">
            <div className="kicker">01 / THE JOURNEY</div>

            <h2>
              One medicine.
              <br />
              Five handovers.
            </h2>

            <p>
              Every custody change becomes a visible step in the medicine's
              journey â€” recorded, validated, and easy to verify.
            </p>
          </div>

          <div className="journey-card">

            <div className="journey-path">

              <svg viewBox="0 0 1100 220" preserveAspectRatio="none">
                <path
                  className="journey-curve"
                  d="M80 110 C180 20 260 190 370 100 C480 10 560 190 670 100 C780 10 860 190 1020 110"
                />
              </svg>

              {journey.map(([title, subtitle, color], index) => (
                <div
                  className={`journey-node node-${index + 1}`}
                  key={title}
                >
                  <div className={`node-ball ${color}`}>
                    <div className="node-inner" />
                  </div>

                  <h4>{title}</h4>
                  <p>{subtitle}</p>
                </div>
              ))}

            </div>

          </div>

        </section>

        {/* VERIFY / MEDICINE PASSPORT */}
        <section id="verify" className="landing-section landing-container">

          <div className="passport-grid">

            <div
              className={`scan-card ${scattering ? "scattering" : ""}`}
              onClick={handleVerify}
            >

              <div className="kicker">02 / VERIFY</div>

              <div className="scan-visual">

                <div className="scan-ring ring-one" />
                <div className="scan-ring ring-two" />

                <div className="scatter-piece piece-1" />
                <div className="scatter-piece piece-2" />
                <div className="scatter-piece piece-3" />
                <div className="scatter-piece piece-4" />
                <div className="scatter-piece piece-5" />
                <div className="scatter-piece piece-6" />

                <div className="fake-qr">
                  <div className="qr-grid" />
                </div>

              </div>

              <div className="scan-label">
                <strong>SCAN & VERIFY</strong>
                <span>Login required to access medicine verification</span>
              </div>

              <div className="scan-hint">
                Click to continue ?
              </div>

            </div>

            <div className="passport-content">

              <div className="kicker">MEDICINE PASSPORT</div>

              <h2>
                Meet the
                <br />
                Medicine Passport.
              </h2>

              <p>
                A single view of medicine identity, status, origin, custody
                journey, and blockchain proof.
              </p>

              <div className="data-grid">

                <div className="data-box">
                  <label>MEDICINE</label>
                  <strong>Amoxicare 500mg</strong>
                </div>

                <div className="data-box">
                  <label>BATCH ID</label>
                  <strong>PC-2026-004821</strong>
                </div>

                <div className="data-box">
                  <label>MANUFACTURER</label>
                  <strong>Pharma Labs</strong>
                </div>

                <div className="data-box">
                  <label>EXPIRY</label>
                  <strong>12 / 2029</strong>
                </div>

              </div>

              <div className="timeline">

                <div className="timeline-event">
                  <div className="timeline-dot" />
                  <div>
                    <strong>Manufacturer ? Distributor</strong>
                    <span>Handover verified Â· 10:42 AM</span>
                  </div>
                </div>

                <div className="timeline-event">
                  <div className="timeline-dot" />
                  <div>
                    <strong>Distributor ? Warehouse</strong>
                    <span>Handover verified Â· 04:18 PM</span>
                  </div>
                </div>

                <div className="timeline-event">
                  <div className="timeline-dot" />
                  <div>
                    <strong>Warehouse ? Pharmacy</strong>
                    <span>In transit Â· Latest update</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* BLOCKCHAIN */}
        <section id="proof" className="proof-section">

          <div className="landing-container">

            <div className="section-head">
              <div className="kicker">03 / BLOCKCHAIN PROOF</div>

              <h2>
                Every handover
                <br />
                leaves a trace.
              </h2>

              <p>
                Trust-critical events are anchored to blockchain while
                detailed application data stays efficiently managed off-chain.
              </p>
            </div>

            <div className="block-grid">

              {[
                ["BATCH CREATED", "Medicine identity registered by authorized manufacturer.", "0x83A...29F"],
                ["OWNERSHIP TRANSFERRED", "Receiver authorization and lifecycle transition validated.", "0xB12...4D8"],
                ["RECEIPT CONFIRMED", "Custody accepted before the next supply-chain step.", "0xC91...A21"],
                ["STATUS VERIFIED", "Current blockchain state matches the medicine passport.", "0xF04...8CC"],
              ].map(([title, text, hash], index) => (

                <div className="block-card" key={title}>

                  <div className={`block-cube cube-${index + 1}`} />

                  <h4>{title}</h4>

                  <p>{text}</p>

                  <small>TX Â· {hash}</small>

                </div>

              ))}

            </div>

          </div>

        </section>

        {/* FEATURES */}
        <section id="features" className="landing-section landing-container">

          <div className="section-head">
            <div className="kicker">04 / BUILT FOR TRUST</div>

            <h2>
              Not just a QR.
              <br />
              A complete story.
            </h2>
          </div>

          <div className="feature-grid">

            {features.map(([icon, title, text]) => (

              <div className="feature-card" key={title}>

                <div className="feature-icon">
                  {icon}
                </div>

                <h4>{title}</h4>

                <p>{text}</p>

              </div>

            ))}

          </div>

        </section>

        {/* SAFETY */}
        <section className="landing-section landing-container">

          <div className="section-head">
            <div className="kicker">05 / SAFETY STATES</div>

            <h2>
              Clear answers.
              <br />
              Not confusing alerts.
            </h2>
          </div>

          <div className="state-grid">

            <div className="state-card verified">
              <span>? VERIFIED</span>
              <h3>Authentic batch</h3>
              <p>
                Blockchain state, custody sequence, and medicine identity
                are consistent.
              </p>
            </div>

            <div className="state-card expiring">
              <span>? EXPIRING SOON</span>
              <h3>Check the date</h3>
              <p>
                Expiry information is surfaced before medicine reaches the
                point of use.
              </p>
            </div>

            <div className="state-card recalled">
              <span>? RECALLED</span>
              <h3>Do not dispense</h3>
              <p>
                The batch has been marked recalled or suspended and requires
                attention.
              </p>
            </div>

          </div>

        </section>

        {/* CTA */}
        <section className="landing-container cta-section">

          <div className="cta-card">

            <div className="cta-kicker">PHARMACHAIN</div>

            <h2>
              Know where your medicine came from.
            </h2>

            <p>
              Scan a package. Verify its journey. See the proof behind the
              medicine.
            </p>

            <button
              className="gold-btn"
              onClick={handleVerify}
            >
              Verify a Medicine ?
            </button>

          </div>

        </section>

      </main>

      {/* FOOTER â€” DETAILS LATER */}
      <footer className="landing-footer landing-container">
        <span>Â© 2026 PharmaChain</span>
        <span>Track Â· Verify Â· Trust</span>
      </footer>

    </div>
  );
}

export default Landing;
