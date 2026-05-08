import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import {
  adjustStock,
  getStockTransactions,
  stockIn,
  stockOut,
} from "../services/stockService";

const initialFormState = {
  productId: "",
  quantity: "",
  newStock: "",
  reason: "",
  note: "",
};

const Stock = () => {
  const [activeTab, setActiveTab] = useState("IN");
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [filterProductId, setFilterProductId] = useState("");
  const [filterType, setFilterType] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const preventNumberScroll = (event) => {
  event.currentTarget.blur();
};

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getProducts();
      setProducts(data.products || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const data = await getStockTransactions({
        productId: filterProductId,
        type: filterType,
      });
      setTransactions(data.transactions || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch stock transactions."
      );
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filterProductId, filterType]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage("");
    setError("");
    setFormData(initialFormState);
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const getSelectedProduct = () => {
    return products.find((product) => product._id === formData.productId);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!formData.productId) {
      setError("Please select a product.");
      return;
    }

    try {
      setFormLoading(true);

      if (activeTab === "IN") {
        if (!formData.quantity || Number(formData.quantity) <= 0) {
          setError("Please enter a valid quantity.");
          return;
        }

        await stockIn({
          productId: formData.productId,
          quantity: Number(formData.quantity),
          reason: formData.reason || "Stock added",
          note: formData.note,
        });

        setMessage("Stock added successfully.");
      }

      if (activeTab === "OUT") {
        if (!formData.quantity || Number(formData.quantity) <= 0) {
          setError("Please enter a valid quantity.");
          return;
        }

        await stockOut({
          productId: formData.productId,
          quantity: Number(formData.quantity),
          reason: formData.reason || "Stock removed",
          note: formData.note,
        });

        setMessage("Stock removed successfully.");
      }

      if (activeTab === "ADJUSTMENT") {
        if (formData.newStock === "" || Number(formData.newStock) < 0) {
          setError("Please enter a valid new stock value.");
          return;
        }

        await adjustStock({
          productId: formData.productId,
          newStock: Number(formData.newStock),
          reason: formData.reason || "Manual stock adjustment",
          note: formData.note,
        });

        setMessage("Stock adjusted successfully.");
      }

      setFormData(initialFormState);
      await fetchProducts();
      await fetchTransactions();
    } catch (error) {
      setError(error.response?.data?.message || "Stock operation failed.");
    } finally {
      setFormLoading(false);
    }
  };

  const selectedProduct = getSelectedProduct();

  return (
    <div>
      <div className="page-header">
        <h1>Stock Management</h1>
        <p>Manage stock in, stock out, adjustment and transaction history.</p>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="stock-page-grid">
        <div className="form-card">
          <div className="stock-tabs">
            <button
              className={activeTab === "IN" ? "active" : ""}
              onClick={() => handleTabChange("IN")}
            >
              Stock In
            </button>

            <button
              className={activeTab === "OUT" ? "active" : ""}
              onClick={() => handleTabChange("OUT")}
            >
              Stock Out
            </button>

            <button
              className={activeTab === "ADJUSTMENT" ? "active" : ""}
              onClick={() => handleTabChange("ADJUSTMENT")}
            >
              Adjust
            </button>
          </div>

          <h2>
            {activeTab === "IN" && "Add Stock"}
            {activeTab === "OUT" && "Remove Stock"}
            {activeTab === "ADJUSTMENT" && "Adjust Stock"}
          </h2>

          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label>Select Product *</label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
              >
                <option value="">
                  {loadingProducts ? "Loading products..." : "Choose product"}
                </option>

                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} — Current: {product.currentStock}{" "}
                    {product.unit}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="selected-product-card">
                <h3>{selectedProduct.name}</h3>
                <p>
                  Current Stock:{" "}
                  <strong>
                    {selectedProduct.currentStock} {selectedProduct.unit}
                  </strong>
                </p>
                <p>
                  Minimum Alert:{" "}
                  <strong>
                    {selectedProduct.minStockLevel} {selectedProduct.unit}
                  </strong>
                </p>
              </div>
            )}

            {(activeTab === "IN" || activeTab === "OUT") && (
              <div className="form-group">
                <label>Quantity *</label>
              <input
  type="number"
  name="quantity"
  placeholder="Enter quantity"
  value={formData.quantity}
  onChange={handleChange}
  onWheel={preventNumberScroll}
  min="1"
  required
/>
              </div>
            )}

            {activeTab === "ADJUSTMENT" && (
              <div className="form-group">
                <label>New Stock Value *</label>
                <input
  type="number"
  name="newStock"
  placeholder="Enter actual counted stock"
  value={formData.newStock}
  onChange={handleChange}
  onWheel={preventNumberScroll}
  min="0"
  required
/>
              </div>
            )}

            <div className="form-group">
              <label>Reason</label>
              <input
                type="text"
                name="reason"
                placeholder={
                  activeTab === "IN"
                    ? "Example: Supplier purchase"
                    : activeTab === "OUT"
                    ? "Example: Damaged stock"
                    : "Example: Physical count correction"
                }
                value={formData.reason}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Note</label>
              <input
                type="text"
                name="note"
                placeholder="Optional note"
                value={formData.note}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={formLoading}>
                {formLoading
                  ? "Saving..."
                  : activeTab === "IN"
                  ? "Add Stock"
                  : activeTab === "OUT"
                  ? "Remove Stock"
                  : "Adjust Stock"}
              </button>
            </div>
          </form>
        </div>

        <div className="table-card">
          <div className="table-header">
            <div>
              <h2>Stock Transaction History</h2>
              <p>{transactions.length} transactions found</p>
            </div>
          </div>

          <div className="stock-filter-row">
            <select
              value={filterProductId}
              onChange={(e) => setFilterProductId(e.target.value)}
            >
              <option value="">All Products</option>

              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="IN">Stock In</option>
              <option value="OUT">Stock Out</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </select>

            <button
              className="secondary-btn"
              onClick={() => {
                setFilterProductId("");
                setFilterType("");
              }}
            >
              Clear Filters
            </button>
          </div>

          {loadingTransactions ? (
            <div className="empty-state">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">No stock transactions found.</div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Previous</th>
                    <th>New</th>
                    <th>Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>
                        <strong>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </strong>
                        <span>
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {transaction.productId?.name || "Deleted Product"}
                        </strong>
                        <span>
                          {transaction.productId?.category || "General"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            transaction.type === "IN"
                              ? "success"
                              : transaction.type === "OUT"
                              ? "danger"
                              : "warning"
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>

                      <td>{transaction.quantity}</td>
                      <td>{transaction.previousStock}</td>
                      <td>{transaction.newStock}</td>
                      <td>{transaction.reason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stock;