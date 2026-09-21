
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Auth.css";
import { register } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MANUFACTURER");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        role
      });

      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Link to="/">
          <div className="auth-logo-mark">?</div>

          <div>
            <strong>PharmaChain</strong>
            <span>TRACK · VERIFY · TRUST</span>
          </div>
        </Link>
      </div>

      <div className="auth-card register-card">
        <div className="auth-heading">
          <div className="auth-kicker">GET STARTED</div>

          <h1>
            Create your
            <br />
            PharmaChain account.
          </h1>

          <p>
            Join the trusted pharmaceutical supply-chain network.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Full name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Email address</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Supply-chain role</label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="MANUFACTURER">Manufacturer</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="WAREHOUSE">Warehouse</option>
              <option value="PHARMACY">Pharmacy</option>
            </select>
          </div>

          <div className="auth-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Confirm password</label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p>{error}</p>}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="auth-switch">
          <span>Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </div>

      <div className="auth-bottom">
        Blockchain-backed · Secure · Verifiable
      </div>
    </div>
  );
}

export default Register;
