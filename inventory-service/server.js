const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const stockRoutes = require("./routes/stockRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    message: "ApnaStock Inventory Service running",
    port: process.env.PORT,
  });
});

app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`Inventory Service running on port ${PORT}`);
});