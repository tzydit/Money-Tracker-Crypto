import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore"; 

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const efetuarCadastro = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("As senhas não correspondem");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
      });

      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.registerContainer}>
        <h1 style={styles.title}>Registrar</h1>
        <form onSubmit={efetuarCadastro}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirmar Senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Registrar
          </button>
          <Link to="/login" style={styles.link}>
            Já tem uma conta? Entrar
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
  registerContainer: {
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
  link: {
    display: "block",
    marginTop: "15px",
    color: "#e63946",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
};

export default Register;
