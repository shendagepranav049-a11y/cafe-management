import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const Home = React.lazy(() => import("./pages/Home.jsx"));
const AdminLogin = React.lazy(() => import("./pages/Adminlogin.jsx"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard.jsx"));
const WaiterLogin = React.lazy(() => import("./pages/waiterlogin.jsx"));
const WaiterDashboard = React.lazy(() => import("./pages/waiterdashboard.jsx"));
const MenuSeeder = React.lazy(() => import("./pages/MenuSeeder.jsx"));

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "Inter, sans-serif" }}><h3>Loading...</h3></div>}>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;