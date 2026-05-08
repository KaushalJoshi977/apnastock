const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createProxyMiddleware } = require("http-proxy-middleware");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(morgan("dev"));

const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
});

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

const verifyToken = (req, res, next) => {
const publicRoutes = ["/", "/api/auth/register", "/api/auth/login"];

  if (publicRoutes.includes(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.headers["x-user-id"] = decoded.userId;
    req.headers["x-shop-id"] = decoded.shopId;
    req.headers["x-user-role"] = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

app.use(verifyToken);
app.use(
  "/api/auth",
  createProxyMiddleware(proxyOptions(process.env.USER_SERVICE_URL))
);

app.use(
  "/api/users",
  createProxyMiddleware(proxyOptions(process.env.USER_SERVICE_URL))
);

app.use(
  "/api/products",
  createProxyMiddleware(proxyOptions(process.env.INVENTORY_SERVICE_URL))
);

app.use(
  "/api/stock",
  createProxyMiddleware(proxyOptions(process.env.INVENTORY_SERVICE_URL))
);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});