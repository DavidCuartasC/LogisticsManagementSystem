import React, { useState, useEffect } from "react";
import { Typography } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../api/auth";

const { Title } = Typography;

const VerifyCode = () => {
  const [formData, setFormData] = useState({ email: "", code: "" });
  const [message, setMessage] = useState({ type: "", content: "" });
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get("email") || "";
    setFormData((prev) => ({ ...prev, email }));
  }, [location.search]);

  useEffect(() => {
    let interval;
    if (resendDisabled && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [resendDisabled, resendTimer]);

  const resendCode = async (e) => {
    e.preventDefault();
    try {
      const response = await auth.resendCode({ email: formData.email });

      if (response.ok) {
        setMessage({ type: "success", content:"A new verification code has been sent to your email." });
        setResendDisabled(true);
        setResendTimer(60);
      } else {
        setMessage({ type: "error", content: "Failed to resend the code." });
      }
    } catch (error) {
      console.error("Resend code error:", error);
      setMessage({ type: "error", content: "Error requesting a new code. Please try again." });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", content: "" });

    const { email, code } = formData;

    if (!code) {
      setMessage({ type: "error", content: "The verification code is required." });
      return;
    }

    try {
      const response = await auth.verifyCode({ email, code });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setMessage({ type: "success", content:"Account verified successfully." });
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMessage({ type: "error", content: "Verification failed." });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setMessage({ type: "error", content: "Error verifying code. Please try again." });
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <Title level={2} style={{ textAlign: "center" }}>
          Verify Account
        </Title>

        <div>
          <p style={{ color: "black", textAlign: "left", marginBottom: "1rem" }}>
            Please enter the verification code that was sent to your email address. 
            If you haven't received the code or if it has expired, please click the link below to request a new one.
          </p>

          <p style={{ textAlign: "left", marginBottom: "1rem" }}>
            {resendDisabled ? (
              <span style={{ color: "gray" }}>
                You can request a new code in {resendTimer} seconds.
              </span>
            ) : (
              <a href="#" onClick={resendCode}>Request a new code</a>
            )}
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="code">Verification Code</label>
          <input
            id="code"
            name="code"
            type="text"
            value={formData.code}
            onChange={handleChange}
            placeholder="Enter the verification code"
            autoComplete="off"
          />
        </div>

        {message.content && (
          <div className={message.type === "error" ? "field-error" : "success-message"}>
            {message.content}
          </div>
        )}

        <button type="submit" className="login-button">
          Verify
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

export default VerifyCode;
