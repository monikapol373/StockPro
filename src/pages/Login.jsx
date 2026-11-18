import React, { useContext, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import AuthShell, { Field } from "../components/AuthShell";

const REMEMBER_KEY = "sp_remember_email";
const getRemembered = () => {
  try {
    return localStorage.getItem(REMEMBER_KEY) || "";
  } catch {
    return "";
  }
};

const Login = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered;

  const [form, setForm] = useState({ email: getRemembered(), password: "" });
  const [remember, setRemember] = useState(!!getRemembered());
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const res = login(form);
      setLoading(false);
      if (!res.ok) return setError(res.error);
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, form.email.trim().toLowerCase());
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {
        /* ignore */
      }
      navigate("/", { replace: true });
    }, 700);
  };

  return (
    <AuthShell>
      <form onSubmit={onSubmit}>
        <h2>Welcome back</h2>
        <p className="au-sub">Login to your account and continue managing your business.</p>

        {justRegistered && !error && (
          <p className="au-success">Account created. Please login with your email and password.</p>
        )}

        <Field icon="mail">
          <input type="email" name="email" value={form.email} onChange={onChange} placeholder="Email address" required />
        </Field>

        <Field icon="lock" toggle={{ show, onClick: () => setShow(!show) }}>
          <input type={show ? "text" : "password"} name="password" value={form.password} onChange={onChange} placeholder="Password" required />
        </Field>

        <label className="au-remember">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me
        </label>

        {error && <p className="au-error">{error}</p>}

        <button type="submit" className="au-btn" disabled={loading}>
          {loading ? <span className="au-spin" /> : "Login"}
        </button>

        <p className="au-switch">Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </AuthShell>
  );
};

export default Login;