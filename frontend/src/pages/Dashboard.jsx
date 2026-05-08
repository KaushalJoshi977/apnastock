import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getLowStockProducts, getProducts } from "../services/productService";

const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    stockValue: 0,
  });

  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const productsData = await getProducts();
      const lowStockData = await getLowStockProducts();

      const products = productsData.products || [];

      const stockValue = products.reduce((total, product) => {
        return total + Number(product.currentStock || 0) * Number(product.purchasePrice || 0);
      }, 0);

      setStats({
        totalProducts: products.length,
        lowStockItems: lowStockData.count || 0,
        stockValue,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your Kirana shop inventory.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Products</h3>
          <p>{loading ? "..." : stats.totalProducts}</p>
        </div>

        <div className="dashboard-card">
          <h3>Low Stock Items</h3>
          <p>{loading ? "..." : stats.lowStockItems}</p>
        </div>

        <div className="dashboard-card">
          <h3>Today Sales</h3>
          <p>Coming soon</p>
        </div>

        <div className="dashboard-card">
          <h3>Stock Value</h3>
          <p>{loading ? "..." : `₹${stats.stockValue}`}</p>
        </div>
      </div>

      <div className="info-box">
        <h2>{user?.shopName}</h2>
        <p>{user?.shopAddress}</p>
      </div>
    </div>
  );
};

export default Dashboard;