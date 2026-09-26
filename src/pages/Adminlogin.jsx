import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await signOut(auth);
        toast.error("User role not found.");
        return;
      }

      const userData = userDoc.data();

      if (userData.role !== "admin") {
        await signOut(auth);
        toast.error("Access denied. This account is not an Admin.");
        return;
      }

      toast.success("Admin Login Successful!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Dark overlay */}
      <div style={styles.overlay}></div>

      {/* Login Card */}
      <div style={styles.card}>
        <div style={styles.logo}>☕</div>

        <h1 style={styles.title}>Cafe Crush</h1>

        <p style={styles.subtitle}>Admin Portal</p>

        <div style={styles.line}></div>

        <form onSubmit={handleLogin}>
          <label style={styles.label}>Admin Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <label style={styles.label}>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Checking..." : "Login as Admin"}
          </button>
        </form>

        <p style={styles.footer}>
          ☕ Manage your cafe with ease
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",

    backgroundImage:
      "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=85')",

    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",

    fontFamily: "Arial, sans-serif",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(25,15,10,0.82), rgba(70,40,20,0.65))",
  },

  card: {
    position: "relative",
    zIndex: 2,
    width: "380px",
    maxWidth: "90%",
    padding: "40px",
    boxSizing: "border-box",

    background: "rgba(255,255,255,0.96)",
    borderRadius: "22px",

    boxShadow:
      "0 25px 60px rgba(0,0,0,0.45)",

    backdropFilter: "blur(10px)",
  },

  logo: {
    width: "70px",
    height: "70px",
    margin: "0 auto 15px",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    borderRadius: "50%",

    background:
      "linear-gradient(135deg, #5c3317, #a86632)",

    color: "white",
    fontSize: "32px",

    boxShadow:
      "0 8px 20px rgba(92,51,23,0.35)",
  },

  title: {
    margin: 0,
    textAlign: "center",

    color: "#3b2112",
    fontSize: "28px",
    fontWeight: "700",
  },

  subtitle: {
    marginTop: "8px",
    marginBottom: "20px",

    textAlign: "center",
    color: "#8b6b52",

    fontSize: "15px",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },

  line: {
    width: "60px",
    height: "3px",
    margin: "0 auto 28px",

    background:
      "linear-gradient(90deg, #6b3e1e, #c58a52)",

    borderRadius: "10px",
  },

  label: {
    display: "block",
    marginBottom: "7px",

    color: "#4a2b18",
    fontSize: "14px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    padding: "14px 15px",
    marginBottom: "20px",

    boxSizing: "border-box",

    border: "1px solid #dbc9b8",
    borderRadius: "10px",

    outline: "none",

    fontSize: "15px",
    background: "#fffaf6",

    color: "#3b2112",
  },

  button: {
    width: "100%",
    padding: "14px",

    border: "none",
    borderRadius: "10px",

    background:
      "linear-gradient(135deg, #5c3317, #9b5c2e)",

    color: "white",

    fontSize: "16px",
    fontWeight: "700",

    cursor: "pointer",

    boxShadow:
      "0 8px 18px rgba(92,51,23,0.3)",
  },

  footer: {
    marginTop: "25px",
    marginBottom: 0,

    textAlign: "center",

    color: "#9a806d",
    fontSize: "13px",
  },
};

export default AdminLogin;