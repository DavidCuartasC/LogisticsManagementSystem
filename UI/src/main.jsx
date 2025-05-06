import "antd/dist/reset.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import VerifyCode from "./components/Auth/VerifyCode";
import Dashboard from "./components/DashBoard";
import ResetPassword from "./components/Password/ResetPassword";
import "./index.css";
import { store } from "./redux/store.js";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyCode />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/password/reset" element={<ResetPassword />} />
          <Route path="/app" element={<App />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
