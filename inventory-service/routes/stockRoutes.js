const express = require("express");

const {
  stockIn,
  stockOut,
  adjustStock,
  getStockTransactions,
} = require("../controllers/stockController");

const attachShopContext = require("../middleware/shopContextMiddleware");

const router = express.Router();

router.use(attachShopContext);

router.post("/in", stockIn);
router.post("/out", stockOut);
router.post("/adjust", adjustStock);
router.get("/transactions", getStockTransactions);

module.exports = router;