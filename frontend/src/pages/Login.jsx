
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Auth.css";
import { login } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message || "Invalid email or password"
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

      <div className="auth-card">
        <div className="auth-heading">
          <div className="auth-kicker">WELCOME BACK</div>

          <h1>
            Sign in to
            <br />
            PharmaChain.
          </h1>

          <p>
            Access your medicines, batches, transfers and verification tools.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
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
            <div className="field-top">
              <label>Password</label>

              <button type="button">
                Forgot password?
              </button>
            </div>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p>{error}</p>}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="auth-switch">
          <span>New to PharmaChain?</span>
          <Link to="/register">Create an account</Link>
        </div>
      </div>

      <div className="auth-bottom">
        Blockchain-backed · Secure · Verifiable
      </div>
    </div>
  );
}

export default Login;
