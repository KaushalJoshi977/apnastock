import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLogo from "./AppLogo";

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <AppLogo/>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/stock">Stock</NavLink>
          {/* <NavLink to="/sales">Sales</NavLink>
          <NavLink to="/purchases">Purchases</NavLink> */}
        </nav>

        <div className="sidebar-footer">
          <p>{user?.shopName}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h3>{user?.shopName || "My Shop"}</h3>
            <p>Welcome, {user?.name}</p>
          </div>
        </header>

        <section className="content-area">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default MainLayout;