import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState({});
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/admin/login");
      } else {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setOrders(data);
        setLoading(false);
      },
      (error) => {
        console.error("Orders load error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const completeOrder = async (orderId) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Completed",
        paymentStatus: "Pending",
      });

      alert("Order Completed!");
    } catch (error) {
      console.error(error);
      alert("Order complete करताना error आला.");
    }
  };

  const markAsPaid = async (orderId) => {
    const method = paymentMethods[orderId];

    if (!method) {
      alert("Please select payment method first.");
      return;
    }

    try {
      await updateDoc(doc(db, "orders", orderId), {
        paymentStatus: "Paid",
        paymentMethod: method,
      });

      alert("Payment marked as Paid!");
    } catch (error) {
      console.error(error);
      alert("Payment update करताना error आला.");
    }
  };

  // PRINT BILL
  const printBill = (order) => {
    const billWindow = window.open("", "_blank");

    if (!billWindow) {
      alert("Please allow pop-ups in your browser.");
      return;
    }

    billWindow.document.write(`
      <html>
        <head>
          <title>CAFE CRUSH - Bill</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              max-width: 500px;
              margin: auto;
              color: #3b2418;
            }

            h1 {
              text-align: center;
              margin-bottom: 5px;
              font-size: 28px;
              letter-spacing: 2px;
              color: #3b2418;
            }

            h2 {
              text-align: center;
              margin-top: 5px;
              margin-bottom: 25px;
              color: #666;
              font-size: 18px;
              font-weight: normal;
            }

            .item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #ddd;
            }

            .total {
              display: flex;
              justify-content: space-between;
              font-size: 20px;
              font-weight: bold;
              margin-top: 20px;
              padding-top: 15px;
              border-top: 2px solid #3b2418;
            }

            .thankyou {
              text-align: center;
              margin-top: 30px;
              color: #666;
            }
          </style>
        </head>

        <body>

          <h1>CAFE CRUSH</h1>

          <h2>Restaurant Bill</h2>

          <p>
            <strong>Order:</strong>
            #${order.id.slice(0, 6)}
          </p>

          <p>
            <strong>Table:</strong>
            ${order.tableNumber || "N/A"}
          </p>

          <p>
            <strong>Payment:</strong>
            ${order.paymentMethod || "N/A"}
          </p>

          <h3>Items</h3>

          ${
            order.items
              ?.map(
                (item) => `
                  <div class="item">
                    <span>
                      ${item.name} - ${item.variant}
                      × ${item.quantity}
                    </span>

                    <span>
                      ₹${item.price * item.quantity}
                    </span>
                  </div>
                `
              )
              .join("") || ""
          }

          <div class="total">
            <span>Total</span>
            <span>₹${order.total}</span>
          </div>

          <h3 class="thankyou">
            Thank You! Visit Again.
          </h3>

        </body>
      </html>
    `);

    billWindow.document.close();

    billWindow.onload = () => {
      billWindow.print();
    };
  };

  if (authLoading) {
    return (
      <div style={styles.center}>
        <div style={styles.loadingIcon}>☕</div>
        <h2 style={styles.loadingTitle}>Checking Admin Login...</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.loadingIcon}>☕</div>
        <h2 style={styles.loadingTitle}>Orders Loading...</h2>
        <p style={styles.loadingText}>Please wait...</p>
      </div>
    );
  }

  const pendingOrders = orders.filter(
    (order) => order.status !== "Completed"
  );

  const completedOrders = orders.filter(
    (order) => order.status === "Completed"
  );

  const paidOrders = orders.filter(
    (order) => order.paymentStatus === "Paid"
  );

  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const sortedOrders = [...orders].sort((a, b) => {
    if (a.status === "Completed" && b.status !== "Completed") return 1;

    if (a.status !== "Completed" && b.status === "Completed") return -1;

    return 0;
  });

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <header style={styles.header}>
        <div style={styles.brandSection}>
          <div style={styles.logo}>☕</div>

          <div>
            <h1 style={styles.title}>Cafe Admin</h1>

            <p style={styles.subtitle}>
              Restaurant Management Dashboard
            </p>
          </div>
        </div>

        <div style={styles.adminBadge}>
          <span style={styles.adminIcon}>👤</span>
          <span>Admin</span>
        </div>
      </header>

      {/* WELCOME BAR */}

      <div style={styles.welcomeBox}>
        <div>
          <h2 style={styles.welcomeTitle}>
            Good day, Admin! ☕
          </h2>

          <p style={styles.welcomeText}>
            Manage your restaurant orders, payments and daily operations.
          </p>
        </div>

        <div style={styles.coffeeEmoji}>
          ☕
        </div>
      </div>

      {/* STATS */}

      <div style={styles.statsBox}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📋</div>

          <div style={styles.statContent}>
            <span style={styles.statLabel}>Total Orders</span>
            <strong style={styles.statNumber}>
              {orders.length}
            </strong>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>🔴</div>

          <div style={styles.statContent}>
            <span style={styles.statLabel}>Pending Orders</span>
            <strong style={styles.statNumber}>
              {pendingOrders.length}
            </strong>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>

          <div style={styles.statContent}>
            <span style={styles.statLabel}>Completed</span>
            <strong style={styles.statNumber}>
              {completedOrders.length}
            </strong>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>

          <div style={styles.statContent}>
            <span style={styles.statLabel}>Revenue</span>
            <strong style={styles.statNumber}>
              ₹{totalRevenue}
            </strong>
          </div>
        </div>
      </div>

      {/* ORDERS TITLE */}

      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.ordersTitle}>
            📋 Orders
          </h2>

          <p style={styles.sectionSubtitle}>
            Live restaurant orders
          </p>
        </div>

        <div style={styles.orderCount}>
          {orders.length} Orders
        </div>
      </div>

      {/* ORDERS */}

      {sortedOrders.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>☕</div>

          <h3 style={styles.emptyTitle}>
            No Orders Yet
          </h3>

          <p style={styles.emptyText}>
            New waiter orders will appear here.
          </p>
        </div>
      ) : (
        <div>
          {sortedOrders.map((order) => {
            const isNew = order.status !== "Completed";

            return (
              <div
                key={order.id}
                style={{
                  ...styles.orderCard,
                  border: isNew
                    ? "2px solid #b91c1c"
                    : "1px solid #d8c7b5",
                  background: isNew
                    ? "#fffaf7"
                    : "#fffdf9",
                }}
              >
                {/* NEW BADGE */}

                {isNew && (
                  <div style={styles.newBadge}>
                    🔴 NEW ORDER
                  </div>
                )}

                {/* ORDER HEADER */}

                <div style={styles.orderHeader}>
                  <div>
                    <p style={styles.orderSmallText}>
                      ORDER
                    </p>

                    <h3 style={styles.orderNumber}>
                      #{order.id.slice(0, 6)}
                    </h3>
                  </div>

                  <span
                    style={{
                      ...styles.statusBadge,
                      background:
                        order.status === "Completed"
                          ? "#dcfce7"
                          : "#fee2e2",

                      color:
                        order.status === "Completed"
                          ? "#166534"
                          : "#991b1b",
                    }}
                  >
                    {order.status === "Completed"
                      ? "✓ Completed"
                      : "● Pending"}
                  </span>
                </div>

                {/* ORDER INFO */}

                <div style={styles.infoGrid}>
                  <div style={styles.infoBox}>
                    <span style={styles.infoLabel}>
                      TABLE
                    </span>

                    <strong style={styles.infoValue}>
                      🪑 Table {order.tableNumber || "N/A"}
                    </strong>
                  </div>

                  <div style={styles.infoBox}>
                    <span style={styles.infoLabel}>
                      PAYMENT
                    </span>

                    <strong style={styles.infoValue}>
                      {order.paymentStatus === "Paid"
                        ? "🟢 Paid"
                        : "🟡 Pending"}
                    </strong>
                  </div>

                  <div style={styles.infoBox}>
                    <span style={styles.infoLabel}>
                      DATE
                    </span>

                    <strong style={styles.infoValue}>
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleString("en-IN")
                        : "N/A"}
                    </strong>
                  </div>
                </div>

                {order.paymentMethod && (
                  <div style={styles.paymentMethod}>
                    💳 Payment Method:{" "}
                    <strong>
                      {order.paymentMethod}
                    </strong>
                  </div>
                )}

                {/* ITEMS */}

                <div style={styles.itemsSection}>
                  <h4 style={styles.itemsTitle}>
                    🍽️ Order Items
                  </h4>

                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      style={styles.itemRow}
                    >
                      <div>
                        <strong style={styles.itemName}>
                          {item.name}
                        </strong>

                        <span style={styles.itemVariant}>
                          {item.variant}
                        </span>
                      </div>

                      <div style={styles.itemRight}>
                        <span style={styles.quantity}>
                          × {item.quantity}
                        </span>

                        <strong>
                          ₹{item.price * item.quantity}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* TOTAL */}

                <div style={styles.totalBox}>
                  <span>Total Amount</span>

                  <strong>
                    ₹{order.total}
                  </strong>
                </div>

                {/* COMPLETE BUTTON */}

                {order.status !== "Completed" && (
                  <button
                    onClick={() =>
                      completeOrder(order.id)
                    }
                    style={styles.completeButton}
                  >
                    ✓ Complete Order
                  </button>
                )}

                {/* PAYMENT */}

                {order.status === "Completed" &&
                  order.paymentStatus !== "Paid" && (
                    <div style={styles.paymentBox}>
                      <h4 style={styles.paymentTitle}>
                        💳 Complete Payment
                      </h4>

                      <label style={styles.selectLabel}>
                        Payment Method
                      </label>

                      <select
                        value={
                          paymentMethods[order.id] || ""
                        }
                        onChange={(e) =>
                          setPaymentMethods({
                            ...paymentMethods,
                            [order.id]:
                              e.target.value,
                          })
                        }
                        style={styles.select}
                      >
                        <option value="" disabled>
                          Select Payment Method
                        </option>

                        <option value="Cash">
                          Cash
                        </option>

                        <option value="UPI">
                          UPI
                        </option>

                        <option value="Card">
                          Card
                        </option>
                      </select>

                      <button
                        onClick={() =>
                          markAsPaid(order.id)
                        }
                        style={styles.paidButton}
                      >
                        💳 Mark as Paid
                      </button>
                    </div>
                  )}

                {/* PAID */}

                {order.paymentStatus === "Paid" && (
                  <div style={styles.paidBox}>
                    <div style={styles.paidMessage}>
                      <span style={styles.paidCheck}>
                        ✓
                      </span>

                      <div>
                        <strong>
                          Payment Completed
                        </strong>

                        <p style={styles.paidSubtext}>
                          Paid via{" "}
                          {order.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        printBill(order)
                      }
                      style={styles.printButton}
                    >
                      🧾 Print Bill
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #2b1b14 0%, #4a2c20 35%, #f5eadc 35%, #f5eadc 100%)",
    padding: "30px",
    boxSizing: "border-box",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    color: "#3b2418",
  },

  header: {
    maxWidth: "1200px",
    margin: "0 auto 25px auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fffaf3",
    padding: "18px 24px",
    borderRadius: "18px",
    boxShadow:
      "0 8px 25px rgba(43,27,20,0.25)",
  },

  brandSection: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  logo: {
    width: "55px",
    height: "55px",
    borderRadius: "14px",
    background: "#4a2c20",
    color: "#f5d7b2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "28px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    color: "#3b2418",
    letterSpacing: "0.5px",
  },

  subtitle: {
    margin: "4px 0 0 0",
    color: "#8a6a55",
    fontSize: "14px",
  },

  adminBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#4a2c20",
    color: "#fffaf3",
    padding: "10px 18px",
    borderRadius: "25px",
    fontWeight: "bold",
  },

  adminIcon: {
    fontSize: "17px",
  },

  welcomeBox: {
    maxWidth: "1200px",
    margin: "0 auto 25px auto",
    background:
      "linear-gradient(135deg, #6b3f2b, #3b2418)",
    color: "#fffaf3",
    padding: "25px 30px",
    borderRadius: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow:
      "0 10px 25px rgba(43,27,20,0.25)",
  },

  welcomeTitle: {
    margin: 0,
    fontSize: "25px",
  },

  welcomeText: {
    margin: "8px 0 0 0",
    color: "#ead7c4",
    fontSize: "14px",
  },

  coffeeEmoji: {
    fontSize: "55px",
  },

  statsBox: {
    maxWidth: "1200px",
    margin: "0 auto 30px auto",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  statCard: {
    background: "#fffaf3",
    padding: "20px",
    borderRadius: "16px",
    boxShadow:
      "0 6px 18px rgba(43,27,20,0.15)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  statIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "13px",
    background: "#ead7c4",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
  },

  statContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  statLabel: {
    color: "#8a6a55",
    fontSize: "13px",
    fontWeight: "bold",
  },

  statNumber: {
    color: "#3b2418",
    fontSize: "25px",
  },

  sectionHeader: {
    maxWidth: "1200px",
    margin: "0 auto 18px auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ordersTitle: {
    margin: 0,
    color: "#fffaf3",
    fontSize: "25px",
  },

  sectionSubtitle: {
    margin: "5px 0 0 0",
    color: "#ead7c4",
    fontSize: "13px",
  },

  orderCount: {
    background: "#fffaf3",
    color: "#4a2c20",
    padding: "8px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "13px",
  },

  orderCard: {
    maxWidth: "1150px",
    margin: "0 auto 22px auto",
    borderRadius: "18px",
    padding: "22px",
    boxShadow:
      "0 8px 25px rgba(43,27,20,0.18)",
    boxSizing: "border-box",
  },

  newBadge: {
    display: "inline-block",
    background: "#b91c1c",
    color: "#fff",
    padding: "7px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "12px",
    marginBottom: "12px",
    letterSpacing: "0.4px",
  },

  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  orderSmallText: {
    margin: 0,
    color: "#9a7a64",
    fontSize: "11px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },

  orderNumber: {
    margin: "4px 0 0 0",
    color: "#3b2418",
    fontSize: "22px",
  },

  statusBadge: {
    padding: "8px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "12px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "14px",
  },

  infoBox: {
    background: "#f5eadc",
    padding: "12px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  infoLabel: {
    color: "#9a7a64",
    fontSize: "10px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },

  infoValue: {
    color: "#4a2c20",
    fontSize: "13px",
  },

  paymentMethod: {
    background: "#f0e4d6",
    padding: "11px 14px",
    borderRadius: "9px",
    marginBottom: "15px",
    fontSize: "13px",
    color: "#5a3a29",
  },

  itemsSection: {
    background: "#fff",
    border: "1px solid #ead7c4",
    borderRadius: "12px",
    padding: "15px",
  },

  itemsTitle: {
    margin: "0 0 10px 0",
    color: "#4a2c20",
    fontSize: "15px",
  },

  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "11px 0",
    borderBottom: "1px solid #eee2d6",
  },

  itemName: {
    display: "block",
    color: "#3b2418",
    fontSize: "14px",
  },

  itemVariant: {
    display: "block",
    color: "#9a7a64",
    fontSize: "12px",
    marginTop: "3px",
  },

  itemRight: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    color: "#4a2c20",
  },

  quantity: {
    color: "#8a6a55",
    fontSize: "13px",
  },

  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "16px",
    padding: "16px",
    background: "#4a2c20",
    color: "#fffaf3",
    borderRadius: "11px",
    fontSize: "16px",
  },

  completeButton: {
    width: "100%",
    padding: "13px",
    marginTop: "15px",
    background: "#166534",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
  },

  paymentBox: {
    marginTop: "15px",
    padding: "18px",
    background: "#f5eadc",
    borderRadius: "12px",
    border: "1px solid #dfc8b1",
  },

  paymentTitle: {
    margin: "0 0 12px 0",
    color: "#4a2c20",
    fontSize: "15px",
  },

  selectLabel: {
    display: "block",
    color: "#6b4a38",
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "6px",
  },

  select: {
    width: "100%",
    padding: "11px",
    borderRadius: "8px",
    border: "1px solid #cdb39e",
    background: "#fffaf3",
    color: "#3b2418",
    boxSizing: "border-box",
    fontSize: "14px",
  },

  paidButton: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    background: "#8b5e34",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
  },

  paidBox: {
    marginTop: "15px",
    padding: "16px",
    background: "#edf7ed",
    borderRadius: "12px",
    border: "1px solid #b9d8b9",
  },

  paidMessage: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#166534",
  },

  paidCheck: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "#166534",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
  },

  paidSubtext: {
    margin: "3px 0 0 0",
    fontSize: "12px",
    color: "#4f7a4f",
  },

  printButton: {
    width: "100%",
    padding: "12px",
    marginTop: "12px",
    background: "#3b2418",
    color: "#fffaf3",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
  },

  emptyBox: {
    maxWidth: "1150px",
    margin: "0 auto",
    background: "#fffaf3",
    padding: "50px 30px",
    textAlign: "center",
    borderRadius: "18px",
    boxShadow:
      "0 8px 25px rgba(43,27,20,0.15)",
  },

  emptyIcon: {
    fontSize: "50px",
    marginBottom: "10px",
  },

  emptyTitle: {
    margin: 0,
    color: "#4a2c20",
  },

  emptyText: {
    color: "#8a6a55",
  },

  center: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #2b1b14, #6b3f2b)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#fffaf3",
  },

  loadingIcon: {
    fontSize: "55px",
    marginBottom: "10px",
  },

  loadingTitle: {
    margin: 0,
  },

  loadingText: {
    color: "#ead7c4",
  },
};

export default AdminDashboard;