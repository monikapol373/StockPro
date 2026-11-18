import React, { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import AuthShell, { Field } from "../components/AuthShell";

const strength = (p) => {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return s;
};
const LABELS = ["Too short", "Weak", "Okay", "Good", "Strong"];

const Register = () => {
  const { user, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const score = form.password ? strength(form.password) : 0;

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Enter your full name.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    setLoading(true);
    setTimeout(() => {
      const res = register(form);
      setLoading(false);
      if (!res.ok) return setError(res.error);
      navigate("/login", { replace: true, state: { registered: true } });
    }, 700);
  };

  return (
    <AuthShell>
      <form onSubmit={onSubmit}>
        <h2>Create your account</h2>
        <p className="au-sub">Get started with StockPro and manage your operations more efficiently.</p>

        <Field icon="user">
          <input name="name" value={form.name} onChange={onChange} placeholder="Full name" required />
        </Field>

        <Field icon="mail">
          <input type="email" name="email" value={form.email} onChange={onChange} placeholder="Email address" required />
        </Field>

        <Field icon="lock" toggle={{ show, onClick: () => setShow(!show) }}>
          <input type={show ? "text" : "password"} name="password" value={form.password} onChange={onChange} placeholder="Password (min 6 characters)" required />
        </Field>

        {form.password && (
          <div className="au-strength">
            <div className="au-bars">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className={i <= score ? `on s${score}` : ""} />
              ))}
            </div>
            <small>{LABELS[score]}</small>
          </div>
        )}

        <Field icon="lock">
          <input type={show ? "text" : "password"} name="confirm" value={form.confirm} onChange={onChange} placeholder="Confirm password" required />
        </Field>

        {error && <p className="au-error">{error}</p>}

        <button type="submit" className="au-btn" disabled={loading}>
          {loading ? <span className="au-spin" /> : "Create account"}
        </button>

        <p className="au-switch">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </AuthShell>
  );
};

export default Register;