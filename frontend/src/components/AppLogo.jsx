import { Link } from "react-router-dom";

const AppLogo = ({ dark = false }) => {
  return (
    <Link to="/dashboard" className={`image-logo-link ${dark ? "dark" : ""}`}>
      <img
        src="/images/apna-store-logo.png"
        alt="ApnaStore Logo"
        className="image-logo"
      />
    </Link>
  );
};

export default AppLogo;