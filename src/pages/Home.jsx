import AdminLogin from "./Adminlogin.jsx";
import WaiterLogin from "./waiterlogin.jsx";

function Home() {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
      }}
    >
      {/* ADMIN LOGIN */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AdminLogin />
      </section>

      {/* WAITER LOGIN */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <WaiterLogin />
      </section>
    </div>
  );
}

export default Home;