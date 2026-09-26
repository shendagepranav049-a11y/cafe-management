import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home.jsx";
import AdminLogin from "./pages/Adminlogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import WaiterLogin from "./pages/waiterlogin.jsx";
import WaiterDashboard from "./pages/waiterdashboard.jsx";
import MenuSeeder from "./pages/MenuSeeder.jsx";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>

        {/* MAIN PAGE */}
        <Route path="/" element={<Home />} />

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* WAITER */}
        <Route path="/waiter/login" element={<WaiterLogin />} />
        <Route path="/waiter/dashboard" element={<WaiterDashboard />} />

        {/* TEMPORARY */}
        <Route path="/menu-seeder" element={<MenuSeeder />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;