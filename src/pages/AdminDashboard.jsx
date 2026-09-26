import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // ADMIN AUTH CHECK
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

  // LOAD ORDERS
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

  // COMPLETE ORDER
  const completeOrder = async (orderId) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Completed",
      });

      toast.success("Order Completed!");
    } catch (error) {
      console.error(error);
      toast.error("Order complete करताना error आला.");
    }
  };

  // DELETE COMPLETED ORDER
  const deleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this completed order?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteDoc(doc(db, "orders", orderId));

      toast.success("Order Deleted Successfully!");
    } catch (error) {
      console.error("Delete order error:", error);
      toast.error("Order delete करताना error आला.");
    }
  };

  // FORMAT DATE
  const formatOrderDate = (createdAt) => {
    if (!createdAt) {
      return "N/A";
    }

    try {
      if (createdAt?.toDate) {
        return createdAt.toDate().toLocaleString("en-IN");
      }

      const date = new Date(createdAt);

      if (Number.isNaN(date.getTime())) {
        return "N/A";
      }

      return date.toLocaleString("en-IN");
    } catch (error) {
      return "N/A";
    }
  };

  // PRINT BILL
  const printBill = (order) => {
    const billWindow = window.open("", "_blank");

    if (!billWindow) {
      toast.error("Please allow pop-ups in your browser.");
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

            .info {
              margin-bottom: 8px;
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

          <p class="info">
            <strong>Table:</strong>
            ${order.tableNumber || "N/A"}
          </p>

          <p class="info">
            <strong>Date:</strong>
            ${formatOrderDate(order.createdAt)}
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

  // AUTH LOADING
  if (authLoading) {
    return (
      <div style={styles.center}>
        <div style={styles.loadingIcon}>☕</div>
        <h2 style={styles.loadingTitle}>
          Checking Admin Login...
        </h2>
      </div>
    );
  }

  // ORDERS LOADING
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.loadingIcon}>☕</div>
        <h2 style={styles.loadingTitle}>
          Orders Loading...
        </h2>

        <p style={styles.loadingText}>
          Please wait...
        </p>
      </div>
    );
  }

  // PENDING FIRST
  const sortedOrders = [...orders].sort((a, b) => {
    if (
      a.status === "Completed" &&
      b.status !== "Completed"
    ) {
      return 1;
    }

    if (
      a.status !== "Completed" &&
      b.status === "Completed"
    ) {
      return -1;
    }

    return 0;
  });

  return (
    <div style={styles.page} className="dashboard-page">

      {/* HEADER */}
      <header style={styles.header} className="dashboard-header">
        <div style={styles.brandSection}>
          <div style={styles.logo}>☕</div>

          <div>
            <h1 style={styles.title}>
              Cafe Admin
            </h1>

            <p style={styles.subtitle}>
              Restaurant Management Dashboard
            </p>
          </div>
        </div>

        <div style={styles.adminBadge} className="dashboard-header-right">
          <span style={styles.adminIcon}>👤</span>
          <span>Admin</span>
        </div>
      </header>

      {/* WELCOME BAR */}
      <div style={styles.welcomeBox} className="welcome-box">
        <div>
          <h2 style={styles.welcomeTitle}>
            Good day, Admin! ☕
          </h2>

          <p style={styles.welcomeText}>
            Manage your restaurant orders and daily operations.
          </p>
        </div>

        <div style={styles.coffeeEmoji}>
          ☕
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
      </div>

      {/* ORDERS */}
      {sortedOrders.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>
            ☕
          </div>

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
            const isCompleted =
              order.status === "Completed";

            return (
              <div
                key={order.id}
                style={{
                  ...styles.orderCard,

                  border: isNew
                    ? "2px solid #b91c1c"
                    : "2px solid #86a98b",

                  background: isNew
                    ? "#fffaf7"
                    : "#f8fff8",
                }}
              >

                {/* NEW ORDER BADGE */}
                {isNew && (
                  <div style={styles.newBadge}>
                    🔴 NEW ORDER
                  </div>
                )}

                {/* COMPLETED BADGE */}
                {isCompleted && (
                  <div style={styles.completedBadge}>
                    ✅ COMPLETED
                  </div>
                )}

                {/* ORDER INFO */}
                <div style={styles.infoGrid} className="info-grid">

                  {/* TABLE */}
                  <div style={styles.infoBox}>
                    <span style={styles.infoLabel}>
                      TABLE NO.
                    </span>

                    <strong style={styles.infoValue}>
                      🪑 Table{" "}
                      {order.tableNumber || "N/A"}
                    </strong>
                  </div>

                  {/* DATE */}
                  <div style={styles.infoBox}>
                    <span style={styles.infoLabel}>
                      DATE & TIME
                    </span>

                    <strong style={styles.infoValue}>
                      {formatOrderDate(
                        order.createdAt
                      )}
                    </strong>
                  </div>

                </div>

                {/* ITEMS */}
                <div style={styles.itemsSection}>
                  <h4 style={styles.itemsTitle}>
                    🍽️ Order Items
                  </h4>

                  {order.items?.map(
                    (item, index) => (
                      <div
                        key={index}
                        style={styles.itemRow}
                        className="item-row"
                      >
                        <div>
                          <strong
                            style={styles.itemName}
                          >
                            {item.name}
                          </strong>

                          <span
                            style={styles.itemVariant}
                          >
                            {item.variant}
                          </span>
                        </div>

                        <div
                          style={styles.itemRight}
                          className="item-right"
                        >
                          <span
                            style={styles.quantity}
                          >
                            × {item.quantity}
                          </span>

                          <strong>
                            ₹
                            {item.price *
                              item.quantity}
                          </strong>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* TOTAL */}
                <div style={styles.totalBox}>
                  <span>
                    Total Amount
                  </span>

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

                {/* COMPLETED ACTIONS */}
                {order.status === "Completed" && (
                  <div style={styles.completedActions}>

                    <button
                      onClick={() =>
                        printBill(order)
                      }
                      style={styles.printButton}
                    >
                      🧾 Print Bill
                    </button>

                    <button
                      onClick={() =>
                        deleteOrder(order.id)
                      }
                      style={styles.deleteButton}
                    >
                      🗑️ Delete Order
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

  sectionHeader: {
    maxWidth: "1150px",
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
    marginBottom: "15px",
    letterSpacing: "0.4px",
  },

  completedBadge: {
    display: "inline-block",
    background: "#166534",
    color: "#fff",
    padding: "7px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "12px",
    marginBottom: "15px",
    letterSpacing: "0.4px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginBottom: "15px",
  },

  infoBox: {
    background: "#f5eadc",
    padding: "14px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  infoLabel: {
    color: "#9a7a64",
    fontSize: "10px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },

  infoValue: {
    color: "#4a2c20",
    fontSize: "14px",
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
    gap: "15px",
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
    whiteSpace: "nowrap",
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

  completedActions: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginTop: "15px",
  },

  printButton: {
    width: "100%",
    padding: "12px",
    background: "#3b2418",
    color: "#fffaf3",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
  },

  deleteButton: {
    width: "100%",
    padding: "12px",
    background: "#b91c1c",
    color: "#fff",
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