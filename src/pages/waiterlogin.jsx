import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function WaiterLogin() {
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

      let userData = null;

      // 1. Try 'users' collection by email
      const usersRef = collection(db, "users");
      const qUsers = query(usersRef, where("email", "==", email));
      let snapshot = await getDocs(qUsers);
      
      if (!snapshot.empty) {
        userData = snapshot.docs[0].data();
      } else {
        // 2. Try 'user' collection by email
        const userRef = collection(db, "user");
        const qUser = query(userRef, where("email", "==", email));
        snapshot = await getDocs(qUser);
        
        if (!snapshot.empty) {
          userData = snapshot.docs[0].data();
        } else {
          // 3. Try 'users' collection by uid
          const uDoc1 = await getDoc(doc(db, "users", user.uid));
          if (uDoc1.exists()) {
            userData = uDoc1.data();
          } else {
            // 4. Try 'user' collection by uid
            const uDoc2 = await getDoc(doc(db, "user", user.uid));
            if (uDoc2.exists()) {
              userData = uDoc2.data();
            }
          }
        }
      }

      if (!userData) {
        await signOut(auth);
        toast.error("User role not found in database.");
        return;
      }

      if (userData.role !== "waiter") {
        await signOut(auth);
        toast.error("Access denied. This account is not a Waiter.");
        return;
      }

      toast.success("Waiter Login Successful!");
      navigate("/waiter/dashboard");
    } catch (error) {
      console.error("Waiter Login Error:", error);
      toast.error("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      <div style={styles.card}>
        <div style={styles.icon}>🍽️</div>

        <h1 style={styles.title}>Cafe Crush</h1>

        <p style={styles.subtitle}>Waiter Portal</p>

        <div style={styles.divider}></div>

        <p style={styles.welcome}>
          Welcome back! 👋
        </p>

        <p style={styles.description}>
          Login to manage tables, orders and customer service.
        </p>

        <form onSubmit={handleLogin}>
          <label style={styles.label}>Waiter Email</label>

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
            {loading ? "Checking..." : "Login as Waiter"}
          </button>
        </form>

        <p style={styles.footer}>
          ☕ Cafe Crush • Serve with a smile
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
      "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=2000&q=85')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    fontFamily: "Arial, sans-serif",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(20,35,25,0.82), rgba(35,60,45,0.68))",
  },

  card: {
    position: "relative",
    zIndex: 2,
    width: "390px",
    maxWidth: "90%",
    padding: "40px",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.96)",
    borderRadius: "24px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.7)",
  },

  icon: {
    width: "72px",
    height: "72px",
    margin: "0 auto 15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #315c45, #5f8f72)",
    fontSize: "32px",
    boxShadow:
      "0 8px 20px rgba(49,92,69,0.35)",
  },

  title: {
    margin: 0,
    textAlign: "center",
    color: "#234332",
    fontSize: "29px",
    fontWeight: "700",
  },

  subtitle: {
    marginTop: "7px",
    marginBottom: "18px",
    textAlign: "center",
    color: "#668171",
    fontSize: "14px",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },

  divider: {
    width: "60px",
    height: "3px",
    margin: "0 auto 22px",
    background:
      "linear-gradient(90deg, #315c45, #8ab49a)",
    borderRadius: "10px",
  },

  welcome: {
    margin: "0 0 6px",
    textAlign: "center",
    color: "#284b38",
    fontSize: "18px",
    fontWeight: "600",
  },

  description: {
    margin: "0 0 25px",
    textAlign: "center",
    color: "#789083",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#355543",
    fontSize: "14px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    padding: "14px 15px",
    marginBottom: "18px",
    boxSizing: "border-box",
    border: "1px solid #cbd9d0",
    borderRadius: "10px",
    outline: "none",
    fontSize: "15px",
    background: "#f8fbf9",
    color: "#294535",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #315c45, #527f64)",
    color: "white",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow:
      "0 8px 18px rgba(49,92,69,0.3)",
  },

  footer: {
    marginTop: "25px",
    marginBottom: 0,
    textAlign: "center",
    color: "#84988c",
    fontSize: "12px",
  },
};

export default WaiterLogin;