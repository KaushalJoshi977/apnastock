const Product = require("../models/Product");
const StockTransaction = require("../models/StockTransaction");

const isPositiveNumber = (value) => {
  return typeof value === "number" && value > 0;
};

const stockIn = async (req, res) => {
  try {
    const { productId, quantity, reason, note } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        message: "Product ID and quantity are required.",
      });
    }

    const stockQuantity = Number(quantity);

    if (!isPositiveNumber(stockQuantity)) {
      return res.status(400).json({
        message: "Quantity must be greater than 0.",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      shopId: req.user.shopId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const previousStock = product.currentStock;
    const newStock = previousStock + stockQuantity;

    product.currentStock = newStock;
    await product.save();

    const transaction = await StockTransaction.create({
      shopId: req.user.shopId,
      productId: product._id,
      type: "IN",
      quantity: stockQuantity,
      previousStock,
      newStock,
      reason: reason || "Stock added",
      note: note || "",
      createdBy: req.user.userId,
    });

    return res.status(200).json({
      message: "Stock added successfully.",
      product,
      transaction,
    });
  } catch (error) {
    console.error("Stock in error:", error);

    return res.status(500).json({
      message: "Something went wrong while adding stock.",
    });
  }
};

const stockOut = async (req, res) => {
  try {
    const { productId, quantity, reason, note } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        message: "Product ID and quantity are required.",
      });
    }

    const stockQuantity = Number(quantity);

    if (!isPositiveNumber(stockQuantity)) {
      return res.status(400).json({
        message: "Quantity must be greater than 0.",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      shopId: req.user.shopId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    if (product.currentStock < stockQuantity) {
      return res.status(400).json({
        message: "Not enough stock available.",
        availableStock: product.currentStock,
      });
    }

    const previousStock = product.currentStock;
    const newStock = previousStock - stockQuantity;

    product.currentStock = newStock;
    await product.save();

    const transaction = await StockTransaction.create({
      shopId: req.user.shopId,
      productId: product._id,
      type: "OUT",
      quantity: stockQuantity,
      previousStock,
      newStock,
      reason: reason || "Stock removed",
      note: note || "",
      createdBy: req.user.userId,
    });

    return res.status(200).json({
      message: "Stock removed successfully.",
      product,
      transaction,
    });
  } catch (error) {
    console.error("Stock out error:", error);

    return res.status(500).json({
      message: "Something went wrong while removing stock.",
    });
  }
};

const adjustStock = async (req, res) => {
  try {
    const { productId, newStock, reason, note } = req.body;

    if (!productId || newStock === undefined) {
      return res.status(400).json({
        message: "Product ID and new stock value are required.",
      });
    }

    const updatedStock = Number(newStock);

    if (Number.isNaN(updatedStock) || updatedStock < 0) {
      return res.status(400).json({
        message: "New stock must be 0 or greater.",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      shopId: req.user.shopId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const previousStock = product.currentStock;
    const difference = updatedStock - previousStock;

    product.currentStock = updatedStock;
    await product.save();

    const transaction = await StockTransaction.create({
      shopId: req.user.shopId,
      productId: product._id,
      type: "ADJUSTMENT",
      quantity: Math.abs(difference),
      previousStock,
      newStock: updatedStock,
      reason: reason || "Manual stock adjustment",
      note: note || "",
      createdBy: req.user.userId,
    });

    return res.status(200).json({
      message: "Stock adjusted successfully.",
      product,
      transaction,
    });
  } catch (error) {
    console.error("Adjust stock error:", error);

    return res.status(500).json({
      message: "Something went wrong while adjusting stock.",
    });
  }
};

const getStockTransactions = async (req, res) => {
  try {
    const { productId, type } = req.query;

    const filter = {
      shopId: req.user.shopId,
    };

    if (productId) {
      filter.productId = productId;
    }

    if (type) {
      filter.type = type;
    }

    const transactions = await StockTransaction.find(filter)
      .populate("productId", "name category brand unit")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Stock transactions error:", error);

    return res.status(500).json({
      message: "Something went wrong while fetching stock transactions.",
    });
  }
};

module.exports = {
  stockIn,
  stockOut,
  adjustStock,
  getStockTransactions,
};