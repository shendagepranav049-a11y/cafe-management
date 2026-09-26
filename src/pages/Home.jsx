import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-overlay"></div>
      
      <div className="home-content">
        <div className="home-logo">☕</div>
        <h1 className="home-title">Cafe Crush</h1>
        <p className="home-subtitle">Restaurant Management System</p>
        <div className="home-line"></div>

        <div className="home-buttons">
          <button 
            className="home-btn admin-btn"
            onClick={() => navigate('/admin/login')}
          >
            <span className="btn-icon">👨‍💼</span>
            Admin Portal
          </button>
          
          <button 
            className="home-btn waiter-btn"
            onClick={() => navigate('/waiter/login')}
          >
            <span className="btn-icon">🍽️</span>
            Waiter Portal
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;