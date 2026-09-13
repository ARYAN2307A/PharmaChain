import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Temporary auth until backend API is connected
    localStorage.setItem("token", "demo-token");
    localStorage.setItem("role", "MANUFACTURER");

    navigate("/dashboard");
  };

  return (
    <div className="auth-page">

      <div className="auth-brand">
        <Link to="/">
          <div className="auth-logo-mark">?</div>

          <div>
            <strong>PharmaChain</strong>
            <span>TRACK â€¢ VERIFY â€¢ TRUST</span>
          </div>
        </Link>
      </div>

      <div className="auth-card">

        <div className="auth-heading">
          <div className="auth-kicker">WELCOME BACK</div>

          <h1>Sign in to<br />PharmaChain.</h1>

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

          <button className="auth-submit" type="submit">
            Sign In ?
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
        Blockchain-backed Â· Secure Â· Verifiable
      </div>

    </div>
  );
}

export default Login;
