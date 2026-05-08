import { useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../services/productService";

const initialFormState = {
  name: "",
  category: "",
  brand: "",
  unit: "Piece",
  purchasePrice: "",
  sellingPrice: "",
  currentStock: "",
  minStockLevel: "",
  expiryDate: "",
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [search, setSearch] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchProducts = async (searchText = "") => {
    try {
      setLoading(true);
      const data = await getProducts(searchText);
      setProducts(data.products || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingProductId(null);
  };

  const preparePayload = () => {
    return {
      name: formData.name,
      category: formData.category || "General",
      brand: formData.brand || "",
      unit: formData.unit || "Piece",
      purchasePrice: Number(formData.purchasePrice || 0),
      sellingPrice: Number(formData.sellingPrice || 0),
      currentStock: Number(formData.currentStock || 0),
      minStockLevel: Number(formData.minStockLevel || 5),
      expiryDate: formData.expiryDate || null,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!formData.name || !formData.sellingPrice) {
      setError("Product name and selling price are required.");
      return;
    }

    try {
      setFormLoading(true);

      const payload = preparePayload();

      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        setMessage("Product updated successfully.");
      } else {
        await createProduct(payload);
        setMessage("Product added successfully.");
      }

      resetForm();
      fetchProducts(search);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save product.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProductId(product._id);

    setFormData({
      name: product.name || "",
      category: product.category || "",
      brand: product.brand || "",
      unit: product.unit || "Piece",
      purchasePrice: product.purchasePrice || "",
      sellingPrice: product.sellingPrice || "",
      currentStock: product.currentStock || "",
      minStockLevel: product.minStockLevel || "",
      expiryDate: product.expiryDate
        ? product.expiryDate.substring(0, 10)
        : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      setMessage("");
      setError("");

      await deleteProduct(productId);

      setMessage("Product deleted successfully.");
      fetchProducts(search);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete product.");
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchProducts(search);
  };

  const clearSearch = () => {
    setSearch("");
    fetchProducts("");
  };

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <p>Add, update and manage your shop products.</p>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="product-page-grid">
        <div className="form-card">
          <h2>{editingProductId ? "Edit Product" : "Add New Product"}</h2>

          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Example: Aashirvaad Atta"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  placeholder="Grocery"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  placeholder="Aashirvaad"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  <option value="Piece">Piece</option>
                  <option value="Kg">Kg</option>
                  <option value="Gram">Gram</option>
                  <option value="Litre">Litre</option>
                  <option value="ML">ML</option>
                  <option value="Packet">Packet</option>
                  <option value="Box">Box</option>
                  <option value="Dozen">Dozen</option>
                </select>
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Purchase Price</label>
                <input
                  type="number"
                  name="purchasePrice"
                  placeholder="0"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Selling Price *</label>
                <input
                  type="number"
                  name="sellingPrice"
                  placeholder="0"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Current Stock</label>
                <input
                  type="number"
                  name="currentStock"
                  placeholder="0"
                  value={formData.currentStock}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Minimum Stock Alert</label>
                <input
                  type="number"
                  name="minStockLevel"
                  placeholder="5"
                  value={formData.minStockLevel}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={formLoading}>
                {formLoading
                  ? "Saving..."
                  : editingProductId
                  ? "Update Product"
                  : "Add Product"}
              </button>

              {editingProductId && (
                <button type="button" className="secondary-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="table-card">
          <div className="table-header">
            <div>
              <h2>Product List</h2>
              <p>{products.length} products found</p>
            </div>

            <form onSubmit={handleSearch} className="search-box">
              <input
                type="text"
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit">Search</button>
              {search && (
                <button type="button" className="secondary-btn" onClick={clearSearch}>
                  Clear
                </button>
              )}
            </form>
          </div>

          {loading ? (
            <div className="empty-state">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              No products found. Add your first product.
            </div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const isLowStock =
                      product.currentStock <= product.minStockLevel;

                    return (
                      <tr key={product._id}>
                        <td>
                          <strong>{product.name}</strong>
                          <span>{product.brand || "No brand"}</span>
                        </td>

                        <td>{product.category || "General"}</td>

                        <td>{product.unit}</td>

                        <td>
                          <strong>₹{product.sellingPrice}</strong>
                          <span>Buy ₹{product.purchasePrice || 0}</span>
                        </td>

                        <td>
                          <strong>
                            {product.currentStock} {product.unit}
                          </strong>
                          <span>Min: {product.minStockLevel}</span>
                        </td>

                        <td>
                          {isLowStock ? (
                            <span className="badge danger">Low Stock</span>
                          ) : (
                            <span className="badge success">In Stock</span>
                          )}
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleEdit(product)}>
                              Edit
                            </button>
                            <button
                              className="danger-btn"
                              onClick={() => handleDelete(product._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;