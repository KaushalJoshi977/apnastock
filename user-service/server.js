const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    message: "ApnaStock User Service running",
    port: process.env.PORT,
  });
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});