import React, { useState } from "react";
import { Typography } from "antd";
import { password } from "../../api/password";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      const res = await password.resetPassword({ email });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send reset email");
      }
    } catch (err) {
      setError("Error sending reset email");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <Title level={2} style={{ textAlign: "center" }}>Reset Password</Title>
        <div>
        <p style={{ color: "black", textAlign: "left", marginBottom: "1rem" }}>
            Please enter your email address below. We’ll send you a link to reset your password.
          </p>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={sent}
          />
        </div>

        {error && <div className="field-error">{error}</div>}
        {sent && <div className="success-message">Reset link sent to your email</div>}

        <button type="submit" className="login-button" disabled={sent}>
          Send Reset Link
        </button>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <p>
            <span
              style={{ color: "#4f46e5", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Back to Login
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
