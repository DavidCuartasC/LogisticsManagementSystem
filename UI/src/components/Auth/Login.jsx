import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../api/auth";
import { setLoading } from "../../redux/authSlice";
import { Typography } from "antd";
import { ROUTES } from "../../utils/constants";
import { validateLoginForm } from "../../utils/validator";
import "./css/Login.css";

const { Title } = Typography;

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
  
    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    dispatch(setLoading(true));
  
    try {
      const response = await auth.signIn(formData);
  
      const responseData = await response.json();
  
      if (response.status === 403) {
        setLoginError(responseData.message);
        navigate(`${ROUTES.VERIFY}?email=${encodeURIComponent(formData.email)}`);
        return;
      }
  
      if (!response.ok) {
        setLoginError(responseData.message || "Invalid email or password");
        return;
      }
  
      navigate(ROUTES.DASHBOARD);
  
    } catch (error) {
      setLoginError("Something went wrong. Please try again.");
    } finally {
      dispatch(setLoading(false));
    }
  };  

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>

      <Title level={2} style={{ textAlign: "center" }}>
          Login
        </Title>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        {loginError && <span className="field-error">{loginError}</span>}

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="login-links">
          <p>
            <Link to={ROUTES.REGISTER}>Sign up here</Link>
          </p>
          <p>
            <Link to={ROUTES.RESET_PASSWORD}>Reset your password</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
