import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;
      const response = await fetch(`${backendAddress}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          alert(data.message || "Login failed: Incorrect Username or Password");
        } else {
          alert("Server error!");
        }
        return;
      }
      localStorage.setItem("token", data.token);
      navigate(`/home/${data.userId}`);
    } catch (error) {
      // handle log in failure case
      alert("Login failed: ");
    }
  };

  return (
    <div className="loginform-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="underline"></div>
        <div className="form-group">
          <label htmlFor="email">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};
export default LoginPage;