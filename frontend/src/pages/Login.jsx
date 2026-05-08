import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AppLogo from "../components/AppLogo";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const location = useLocation();
const successMessage = location.state?.message;
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo-top">
  <AppLogo dark />
</div>
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Login to manage your Kirana inventory.</p>

        {error && <div className="error-box">{error}</div>}
{successMessage && <div className="success-box">{successMessage}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-link">
          New shop owner? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;