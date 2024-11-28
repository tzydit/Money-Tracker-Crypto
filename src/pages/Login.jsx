import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const efetuarLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.loginContainer}>
        <h1 style={styles.title}>Login</h1>
        <form onSubmit={efetuarLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
          <Link to="/register" style={styles.link}>
            Don't have an account? Register
          </Link>
        </form>
      </div>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: "'Roboto', sans-serif",
    margin: 0,
    padding: 0,
    backgroundColor: "#181818",
    color: "#ffffff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", 
    overflow: "hidden", 
  },
  loginContainer: {
    backgroundColor: "#202020",
    padding: "40px 30px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.5)",
    width: "400px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "20px",
    color: "#ffffff",
    borderBottom: "2px solid #333",
    paddingBottom: "10px",
  },
  input: {
    width: "calc(100% - 20px)", 
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #555",
    borderRadius: "5px",
    backgroundColor: "#282828",
    color: "#ffffff",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "10px 20px",
    marginTop: "15px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#e63946",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#ff4d6d",
  },
  link: {
    display: "block",
    marginTop: "15px",
    color: "#e63946",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  linkHover: {
    color: "#ff4d6d",
  },
};

export default Login;
