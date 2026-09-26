import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, query, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function WaiterDashboard() {
  const navigate = useNavigate();

  const [authLoading, setAuthLoading] = useState(true);
  const [menuData, setMenuData] = useState([]);
  const [order, setOrder] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Firebase Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/waiter/login");
      } else {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Firebase madhun menu load
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const snapshot = await getDocs(collection(db, "menu"));

        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((item) => item.active !== false);

        const groupedMenu = [];

        data.forEach((item) => {
          let category = groupedMenu.find(
            (cat) => cat.category === item.category
          );

          if (!category) {
            category = {
              category: item.category,
              items: [],
            };

            groupedMenu.push(category);
          }

          category.items.push({
            name: item.name,
            variants: (item.variants || []).map((v) => [
              v.variant,
              v.price,
            ]),
          });
        });

        setMenuData(groupedMenu);
      } catch (error) {
        console.error("Menu load error:", error);
        setFetchError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  // Order History load
  const loadOrderHistory = async () => {
    try {
      setHistoryLoading(true);

      const q = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      data.sort((a, b) => {
        return (
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
        );
      });

      setOrderHistory(data);
    } catch (error) {
      console.error("Order history load error:", error);

      toast.error(
        "Order history load करताना error आला: " +
          error.message
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOrderHistory = () => {
    const newValue = !showOrderHistory;

    setShowOrderHistory(newValue);

    if (newValue) {
      loadOrderHistory();
    }
  };

  // Add item
  const addToOrder = (name, variant, price) => {
    const existingItem = order.find(
      (item) =>
        item.name === name &&
        item.variant === variant
    );

    if (existingItem) {
      setOrder(
        order.map((item) =>
          item.id === existingItem.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        )
      );
    } else {
      setOrder([
        ...order,
        {
          id: Date.now(),
          name,
          variant,
          price,
          quantity: 1,
        },
      ]);
    }
    toast.success(`Added ${name} - ${variant} to order`, { duration: 1000 });
  };

  // Quantity decrease
  const decreaseQuantity = (id) => {
    setOrder(
      order
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Quantity increase
  const increaseQuantity = (id) => {
    setOrder(
      order.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const total = order.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  // Send order
  const sendOrderToAdmin = async () => {
    if (tableNumber === "") {
      toast.error("Please select table number first.");
      return;
    }

    if (order.length === 0) {
      toast.error("Please first add item to order.");
      return;
    }

    try {
      const newOrder = {
        tableNumber: tableNumber,
        items: order,
        total: total,
        status: "Pending",
        paymentStatus: "Pending",
        createdAt: new Date().toISOString(),
      };

      const orderRef = await addDoc(
        collection(db, "orders"),
        newOrder
      );

      const orderId = orderRef.id;

      setOrder([]);
      setTableNumber("");

      toast.success(
        `Order Successfully Sent!\n\nOrder ID: ${orderId.slice(
          0,
          8
        )}\nTable: ${newOrder.tableNumber}\nTotal: ₹${newOrder.total}`,
        { duration: 4000 }
      );
    } catch (error) {
      console.error("Order save error:", error);

      toast.error(
        "Order save करताना error आला: " +
          error.message
      );
    }
  };

  // Date format
  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString("en-IN");
  };

  // Loading
  if (authLoading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingIcon}>☕</div>

        <h2 style={styles.loadingTitle}>
          Checking Waiter Login...
        </h2>

        <p style={styles.loadingText}>
          Firebase login check होत आहे.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingIcon}>☕</div>

        <h2 style={styles.loadingTitle}>
          Menu Loading...
        </h2>

        <p style={styles.loadingText}>
          Firebase मधून menu load होत आहे.
        </p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingIcon}>❌</div>
        <h2 style={styles.loadingTitle}>{fetchError}</h2>
        <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer", background: "#3b2418", color: "#fff", border: "none", borderRadius: "5px" }}>Retry</button>
      </div>
    );
  }

  const filteredMenuData = menuData
    .map((category) => {
      const filteredItems = category.items.filter((item) =>
        item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...category, items: filteredItems };
    })
    .filter((category) => category.items.length > 0);

  return (
    <div style={styles.page} className="dashboard-page">
      {/* HEADER */}

      <header style={styles.header} className="dashboard-header">
        <div style={styles.brandSection}>
          <div style={styles.logo}>☕</div>

          <div>
            <h1 style={styles.title}>
              Cafe Waiter
            </h1>

            <p style={styles.subtitle}>
              Order Management
            </p>
          </div>
        </div>

        <div style={styles.waiterBadge} className="dashboard-header-right">
          👤 Waiter
        </div>
      </header>

      {/* MAIN CONTENT */}

      <div style={styles.mainLayout} className="waiter-layout">
        {/* LEFT MENU */}

        <main style={styles.menuSection}>
          <div style={styles.menuHeading} className="menu-heading">
            <div>
              <h2 style={styles.sectionTitle}>
                🍽️ Menu
              </h2>

              <p style={styles.sectionSubtitle}>
                Select items and add them to the order
              </p>
            </div>

            <button
              style={styles.historyButton}
              onClick={handleOrderHistory}
            >
              📋{" "}
              {showOrderHistory
                ? "Hide History"
                : "Order History"}
            </button>
          </div>

          {/* SEARCH BAR */}
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* TABLE SELECT */}

          <div style={styles.tableBox}>
            <div style={styles.tableIcon}>
              🪑
            </div>

            <div style={styles.tableContent}>
              <label style={styles.tableLabel}>
                Select Table
              </label>

              <select
                value={tableNumber}
                onChange={(e) =>
                  setTableNumber(e.target.value)
                }
                style={styles.tableSelect}
              >
                <option value="">
                  Choose Table Number
                </option>

                <option value="1">Table 1</option>
                <option value="2">Table 2</option>
                <option value="3">Table 3</option>
                <option value="4">Table 4</option>
                <option value="5">Table 5</option>
                <option value="6">Table 6</option>
                <option value="7">Table 7</option>
                <option value="8">Table 8</option>
                <option value="9">Table 9</option>
                <option value="10">Table 10</option>
              </select>
            </div>

            <div style={styles.selectedTable}>
              {tableNumber
                ? `Table ${tableNumber}`
                : "No Table"}
            </div>
          </div>

          {/* ORDER HISTORY */}

          {showOrderHistory && (
            <div style={styles.historyBox}>
              <div style={styles.historyHeader}>
                <div>
                  <h2 style={styles.historyTitle}>
                    📋 Order History
                  </h2>

                  <p style={styles.historySubtitle}>
                    Previous restaurant orders
                  </p>
                </div>

                <button
                  style={styles.refreshButton}
                  onClick={loadOrderHistory}
                >
                  ↻ Refresh
                </button>
              </div>

              {historyLoading ? (
                <div style={styles.historyMessage}>
                  <div style={styles.smallLoader}>
                    ☕
                  </div>

                  Loading order history...
                </div>
              ) : orderHistory.length === 0 ? (
                <div style={styles.historyMessage}>
                  No orders found.
                </div>
              ) : (
                <div style={styles.historyList}>
                  {orderHistory.map(
                    (historyOrder) => (
                      <div
                        key={historyOrder.id}
                        style={styles.historyCard}
                      >
                        <div style={styles.historyTop}>
                          <div>
                            <span
                              style={
                                styles.historyOrderLabel
                              }
                            >
                              ORDER
                            </span>

                            <strong
                              style={
                                styles.historyOrderId
                              }
                            >
                              #
                              {historyOrder.id.slice(
                                0,
                                8
                              )}
                            </strong>
                          </div>

                          <span
                            style={{
                              ...styles.statusBadge,
                              background:
                                historyOrder.status ===
                                "Completed"
                                  ? "#dcfce7"
                                  : "#fee2e2",

                              color:
                                historyOrder.status ===
                                "Completed"
                                  ? "#166534"
                                  : "#991b1b",
                            }}
                          >
                            {historyOrder.status ===
                            "Completed"
                              ? "✓ Completed"
                              : "● Pending"}
                          </span>
                        </div>

                        <div
                          style={
                            styles.historyInfoGrid
                          }
                        >
                          <div>
                            <span
                              style={
                                styles.historyInfoLabel
                              }
                            >
                              TABLE
                            </span>

                            <strong>
                              🪑{" "}
                              {historyOrder.tableNumber ||
                                "N/A"}
                            </strong>
                          </div>

                          <div>
                            <span
                              style={
                                styles.historyInfoLabel
                              }
                            >
                              TOTAL
                            </span>

                            <strong>
                              ₹
                              {historyOrder.total ||
                                0}
                            </strong>
                          </div>

                          <div>
                            <span
                              style={
                                styles.historyInfoLabel
                              }
                            >
                              PAYMENT
                            </span>

                            <strong>
                              {historyOrder.paymentStatus ===
                              "Paid"
                                ? "🟢 Paid"
                                : "🟡 Pending"}
                            </strong>
                          </div>
                        </div>

                        {historyOrder.paymentMethod && (
                          <div
                            style={
                              styles.historyPayment
                            }
                          >
                            💳{" "}
                            {historyOrder.paymentMethod}
                          </div>
                        )}

                        <div
                          style={
                            styles.historyDate
                          }
                        >
                          🕒{" "}
                          {formatDate(
                            historyOrder.createdAt
                          )}
                        </div>

                        <div
                          style={
                            styles.historyItems
                          }
                        >
                          <strong>
                            🍽️ Items
                          </strong>

                          {historyOrder.items?.map(
                            (item, index) => (
                              <div
                                key={index}
                                style={
                                  styles.historyItem
                                }
                              >
                                <span>
                                  {item.name}
                                  <small>
                                    {" "}
                                    - {item.variant}
                                  </small>
                                </span>

                                <span>
                                  {item.quantity} × ₹
                                  {item.price}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* MENU CATEGORIES */}

          {filteredMenuData.length === 0 && searchQuery !== "" ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#8a6a55" }}>
              <h3>No items match your search.</h3>
            </div>
          ) : (
            filteredMenuData.map((category) => (
            <section
              key={category.category}
              style={styles.categoryBox}
            >
              <div style={styles.categoryHeader}>
                <div style={styles.categoryIcon}>
                  🍽️
                </div>

                <div>
                  <h2 style={styles.categoryTitle}>
                    {category.category}
                  </h2>

                  <p style={styles.categorySubtitle}>
                    Choose your preferred item
                  </p>
                </div>
              </div>

              <div style={styles.itemsGrid} className="items-grid">
                {category.items.map((item) => (
                  <div
                    key={item.name}
                    style={styles.itemCard}
                  >
                    <div style={styles.itemTop}>
                      <div style={styles.itemIcon}>
                        ☕
                      </div>

                      <h3 style={styles.itemName}>
                        {item.name}
                      </h3>
                    </div>

                    <div
                      style={
                        styles.variantContainer
                      }
                    >
                      {item.variants.map(
                        ([variant, price]) => (
                          <button
                            key={variant}
                            style={
                              styles.variantButton
                            }
                            onClick={() =>
                              addToOrder(
                                item.name,
                                variant,
                                price
                              )
                            }
                          >
                            <span>
                              {variant}
                            </span>

                            <strong>
                              ₹{price}
                            </strong>

                            <span
                              style={
                                styles.addIcon
                              }
                            >
                              +
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )))}
        </main>

        {/* RIGHT CURRENT ORDER */}

        <aside style={styles.orderSection} id="order-section">
          <div style={styles.orderBox}>
            <div style={styles.orderHeader}>
              <div>
                <span
                  style={styles.orderSmallLabel}
                >
                  CURRENT ORDER
                </span>

                <h2 style={styles.orderTitle}>
                  🛒 Your Order
                </h2>
              </div>

              <div style={styles.cartCount}>
                {order.reduce(
                  (sum, item) =>
                    sum + item.quantity,
                  0
                )}
              </div>
            </div>

            <div style={styles.orderTable}>
              🪑{" "}
              {tableNumber
                ? `Table ${tableNumber}`
                : "Table Not Selected"}
            </div>

            {order.length === 0 ? (
              <div style={styles.emptyOrder}>
                <div style={styles.emptyCartIcon}>
                  🛒
                </div>

                <h3 style={styles.emptyOrderTitle}>
                  Order is Empty
                </h3>

                <p style={styles.emptyOrderText}>
                  Select items from the menu to
                  create an order.
                </p>
              </div>
            ) : (
              <>
                <div style={styles.orderItems}>
                  {order.map((item) => (
                    <div
                      key={item.id}
                      style={styles.orderItem}
                    >
                      <div
                        style={
                          styles.orderItemTop
                        }
                        className="order-item-top"
                      >
                        <div
                          style={
                            styles.orderItemDetails
                          }
                        >
                          <strong
                            style={
                              styles.orderItemName
                            }
                          >
                            {item.name}
                          </strong>

                          <span
                            style={
                              styles.orderItemVariant
                            }
                          >
                            {item.variant}
                          </span>

                          <span
                            style={
                              styles.orderItemPrice
                            }
                          >
                            ₹{item.price} each
                          </span>
                        </div>

                        <strong
                          style={
                            styles.orderItemTotal
                          }
                        >
                          ₹
                          {item.price *
                            item.quantity}
                        </strong>
                      </div>

                      <div
                        style={
                          styles.quantityRow
                        }
                      >
                        <span
                          style={
                            styles.quantityLabel
                          }
                        >
                          Quantity
                        </span>

                        <div
                          style={
                            styles.quantityBox
                          }
                        >
                          <button
                            style={
                              styles.qtyButton
                            }
                            onClick={() =>
                              decreaseQuantity(
                                item.id
                              )
                            }
                          >
                            −
                          </button>

                          <span
                            style={
                              styles.quantity
                            }
                          >
                            {item.quantity}
                          </span>

                          <button
                            style={{
                              ...styles.qtyButton,
                              ...styles.plusButton,
                            }}
                            onClick={() =>
                              increaseQuantity(
                                item.id
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.totalBox}>
                  <span>Total Amount</span>

                  <strong>
                    ₹{total}
                  </strong>
                </div>

                <button
                  style={styles.sendButton}
                  onClick={sendOrderToAdmin}
                >
                  <span>📤</span>
                  Send Order to Admin
                </button>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Spacer to prevent FAB overlap on mobile */}
      <div style={{ height: "90px", width: "100%" }}></div>

      {/* MOBILE FLOATING CART BUTTON (Round with badge) */}
      <a href="#order-section" className="mobile-cart-fab">
        🛒
        {order.length > 0 && (
          <span className="mobile-cart-badge">
            {order.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        )}
      </a>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #2b1b14 0%, #4a2c20 32%, #f5eadc 32%, #f5eadc 100%)",
    padding: "25px",
    boxSizing: "border-box",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    color: "#3b2418",
  },

  loadingPage: {
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

  header: {
    maxWidth: "1400px",
    margin: "0 auto 22px auto",
    background: "#fffaf3",
    padding: "17px 22px",
    borderRadius: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow:
      "0 8px 25px rgba(43,27,20,0.22)",
  },

  brandSection: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  logo: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#4a2c20",
    color: "#f5d7b2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "27px",
  },

  title: {
    margin: 0,
    fontSize: "27px",
    color: "#3b2418",
  },

  subtitle: {
    margin: "3px 0 0",
    color: "#8a6a55",
    fontSize: "13px",
  },

  waiterBadge: {
    background: "#4a2c20",
    color: "#fffaf3",
    padding: "10px 17px",
    borderRadius: "22px",
    fontWeight: "bold",
    fontSize: "14px",
  },

  mainLayout: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) 380px",
    gap: "22px",
    alignItems: "start",
  },

  menuSection: {
    minWidth: 0,
  },

  menuHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "18px",
  },

  searchContainer: {
    background: "#fffaf3",
    borderRadius: "15px",
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    boxShadow: "0 4px 12px rgba(43,27,20,0.1)",
  },

  searchIcon: {
    fontSize: "18px",
  },

  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "16px",
    width: "100%",
    color: "#3b2418",
  },

  sectionTitle: {
    margin: 0,
    color: "#fffaf3",
    fontSize: "25px",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#ead7c4",
    fontSize: "13px",
  },

  historyButton: {
    border: "none",
    background: "#fffaf3",
    color: "#4a2c20",
    padding: "11px 16px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "bold",
    boxShadow:
      "0 4px 12px rgba(43,27,20,0.18)",
  },

  tableBox: {
    background: "#fffaf3",
    padding: "16px",
    borderRadius: "15px",
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    boxShadow:
      "0 5px 18px rgba(43,27,20,0.14)",
  },

  tableIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "11px",
    background: "#ead7c4",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "21px",
  },

  tableContent: {
    flex: 1,
  },

  tableLabel: {
    display: "block",
    color: "#6b4a38",
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "5px",
  },

  tableSelect: {
    width: "100%",
    padding: "9px 10px",
    borderRadius: "7px",
    border: "1px solid #cdb39e",
    background: "#fff",
    color: "#3b2418",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  selectedTable: {
    background: "#4a2c20",
    color: "#fffaf3",
    padding: "10px 13px",
    borderRadius: "9px",
    fontWeight: "bold",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  historyBox: {
    background: "#fffaf3",
    padding: "20px",
    marginBottom: "18px",
    borderRadius: "15px",
    boxShadow:
      "0 6px 20px rgba(43,27,20,0.16)",
  },

  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  historyTitle: {
    margin: 0,
    color: "#4a2c20",
    fontSize: "20px",
  },

  historySubtitle: {
    margin: "4px 0 0",
    color: "#8a6a55",
    fontSize: "12px",
  },

  refreshButton: {
    border: "none",
    background: "#4a2c20",
    color: "#fffaf3",
    padding: "8px 13px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  historyMessage: {
    padding: "30px",
    textAlign: "center",
    color: "#8a6a55",
  },

  smallLoader: {
    fontSize: "30px",
    marginBottom: "8px",
  },

  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "550px",
    overflowY: "auto",
  },

  historyCard: {
    border: "1px solid #dfc8b1",
    borderRadius: "11px",
    padding: "15px",
    background: "#fffdf9",
  },

  historyTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  historyOrderLabel: {
    display: "block",
    color: "#9a7a64",
    fontSize: "9px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },

  historyOrderId: {
    color: "#4a2c20",
    fontSize: "15px",
  },

  statusBadge: {
    padding: "6px 10px",
    borderRadius: "18px",
    fontSize: "11px",
    fontWeight: "bold",
  },

  historyInfoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "8px",
    marginBottom: "10px",
  },

  historyInfoLabel: {
    display: "block",
    color: "#9a7a64",
    fontSize: "9px",
    fontWeight: "bold",
    marginBottom: "3px",
  },

  historyPayment: {
    background: "#f0e4d6",
    padding: "8px",
    borderRadius: "7px",
    fontSize: "12px",
    marginBottom: "8px",
  },

  historyDate: {
    color: "#8a6a55",
    fontSize: "11px",
    marginBottom: "10px",
  },

  historyItems: {
    borderTop: "1px solid #ead7c4",
    paddingTop: "10px",
    fontSize: "12px",
  },

  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px 0",
    color: "#5a3a29",
  },

  categoryBox: {
    background: "#fffaf3",
    padding: "20px",
    marginBottom: "18px",
    borderRadius: "16px",
    boxShadow:
      "0 6px 20px rgba(43,27,20,0.14)",
  },

  categoryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },

  categoryIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "11px",
    background: "#ead7c4",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
  },

  categoryTitle: {
    margin: 0,
    color: "#4a2c20",
    fontSize: "19px",
  },

  categorySubtitle: {
    margin: "3px 0 0",
    color: "#9a7a64",
    fontSize: "11px",
  },

  itemsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(210px, 1fr))",
    gap: "12px",
  },

  itemCard: {
    border: "1px solid #ead7c4",
    borderRadius: "12px",
    padding: "14px",
    background: "#fffdf9",
  },

  itemTop: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginBottom: "12px",
  },

  itemIcon: {
    width: "35px",
    height: "35px",
    borderRadius: "9px",
    background: "#f0e4d6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "17px",
  },

  itemName: {
    margin: 0,
    color: "#3b2418",
    fontSize: "15px",
  },

  variantContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  variantButton: {
    width: "100%",
    border: "1px solid #d6bda7",
    background: "#f8eee3",
    color: "#4a2c20",
    padding: "9px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
    display: "grid",
    gridTemplateColumns:
      "1fr auto 24px",
    alignItems: "center",
    gap: "6px",
    textAlign: "left",
  },

  addIcon: {
    width: "23px",
    height: "23px",
    borderRadius: "6px",
    background: "#4a2c20",
    color: "#fffaf3",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "17px",
  },

  orderSection: {
    width: "100%",
    minWidth: 0,
  },

  orderBox: {
    background: "#fffaf3",
    borderRadius: "18px",
    padding: "20px",
    position: "sticky",
    top: "20px",
    boxShadow:
      "0 10px 28px rgba(43,27,20,0.22)",
    boxSizing: "border-box",
  },

  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ead7c4",
    paddingBottom: "14px",
  },

  orderSmallLabel: {
    color: "#9a7a64",
    fontSize: "9px",
    fontWeight: "bold",
    letterSpacing: "1.2px",
  },

  orderTitle: {
    margin: "3px 0 0",
    color: "#3b2418",
    fontSize: "21px",
  },

  cartCount: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "#4a2c20",
    color: "#fffaf3",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
  },

  orderTable: {
    background: "#f0e4d6",
    color: "#4a2c20",
    padding: "10px 12px",
    borderRadius: "8px",
    marginTop: "14px",
    marginBottom: "10px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  emptyOrder: {
    textAlign: "center",
    padding: "45px 15px",
  },

  emptyCartIcon: {
    fontSize: "48px",
    marginBottom: "8px",
  },

  emptyOrderTitle: {
    margin: 0,
    color: "#4a2c20",
    fontSize: "17px",
  },

  emptyOrderText: {
    color: "#9a7a64",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  orderItems: {
    maxHeight: "440px",
    overflowY: "auto",
  },

  orderItem: {
    padding: "13px 0",
    borderBottom: "1px solid #ead7c4",
  },

  orderItemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },

  orderItemDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  orderItemName: {
    color: "#3b2418",
    fontSize: "14px",
  },

  orderItemVariant: {
    color: "#8a6a55",
    fontSize: "11px",
  },

  orderItemPrice: {
    color: "#9a7a64",
    fontSize: "10px",
  },

  orderItemTotal: {
    color: "#4a2c20",
    fontSize: "14px",
  },

  quantityRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "9px",
  },

  quantityLabel: {
    color: "#9a7a64",
    fontSize: "11px",
  },

  quantityBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  qtyButton: {
    width: "28px",
    height: "28px",
    border: "none",
    borderRadius: "7px",
    background: "#ead7c4",
    color: "#4a2c20",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
  },

  plusButton: {
    background: "#4a2c20",
    color: "#fffaf3",
  },

  quantity: {
    minWidth: "20px",
    textAlign: "center",
    fontWeight: "bold",
    color: "#4a2c20",
  },

  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#4a2c20",
    color: "#fffaf3",
    padding: "15px",
    marginTop: "15px",
    borderRadius: "10px",
    fontSize: "16px",
  },

  sendButton: {
    width: "100%",
    border: "none",
    background:
      "linear-gradient(135deg, #8b5e34, #4a2c20)",
    color: "#fff",
    padding: "14px",
    marginTop: "12px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    boxShadow:
      "0 5px 12px rgba(74,44,32,0.25)",
  },
};

export default WaiterDashboard;