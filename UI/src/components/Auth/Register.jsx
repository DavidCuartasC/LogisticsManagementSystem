import React, { useState } from "react";
import { Typography } from "antd";
import { auth } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import "./css/Register.css";

const { Title } = Typography;


const Register = () => {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    secondLastName: "",
    email: "",
    phone: "",
    password: "",
    rol: "",
  });


  const [errors, setErrors] = useState({});
  const [registerSuccess, setRegisterSuccess] = useState(null);
  const [registerError, setRegisterError] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterSuccess(null);
    setRegisterError(null);

    if (!validateForm()) return;
    console.log(formData);
    try {
      const res = await auth.signUp(formData);
      setRegisterSuccess("Account created. Check your email to verify.");
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        secondLastName: "",
        email: "",
        phone: "",
        password: "",
        rol: "",
      });
    } catch (error) {
      setRegisterError("Failed to register. Try again.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <Title level={2} style={{ textAlign: "center" }}>Register</Title>

        {["firstName", "middleName", "lastName", "secondLastName", "email", "phone", "password"].map((field) => (
          <div className="form-group" key={field}>
            <label htmlFor={field}>{field.replace(/([A-Z])/g, " $1")}</label>
            <input
              type={field === "password" ? "password" : "text"}
              id={field}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder={`Enter your ${field}`}
            />
            {errors[field] && <span className="field-error">{errors[field]}</span>}
          </div>
        ))}

        <div className="form-group">
          <label htmlFor="rol">Select a role:</label>
          <select
            id="rol"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
          >
            <option value="">-- Choose an option --</option>
            <option value="Administrador">Administrador</option>
            <option value="Repartidor">Repartidor</option>
            <option value="Gerente">Gerente</option>
            <option value="Despachador">Despachador</option>
          </select>
          {errors.rol && <span className="field-error">{errors.rol}</span>}
        </div>

        {registerSuccess && <div className="success-message">{registerSuccess}</div>}
        {registerError && <div className="field-error">{registerError}</div>}

        <button type="submit" className="login-button">Register</button>

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

export default Register;
