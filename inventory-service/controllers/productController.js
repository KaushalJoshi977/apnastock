const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      unit,
      purchasePrice,
      sellingPrice,
      currentStock,
      minStockLevel,
      expiryDate,
    } = req.body;

    if (!name || sellingPrice === undefined || sellingPrice === null) {
      return res.status(400).json({
        message: "Product name and selling price are required.",
      });
    }

    const product = await Product.create({
      shopId: req.user.shopId,
      name,
      category,
      brand,
      unit,
      purchasePrice: purchasePrice || 0,
      sellingPrice,
      currentStock: currentStock || 0,
      minStockLevel: minStockLevel || 5,
      expiryDate: expiryDate || null,
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      message: "Something went wrong while creating product.",
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const { search, category, lowStock } = req.query;

    const filter = {
      shopId: req.user.shopId,
      isActive: true,
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (lowStock === "true") {
      filter.$expr = {
        $lte: ["$currentStock", "$minStockLevel"],
      };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      message: "Something went wrong while fetching products.",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      shopId: req.user.shopId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      product,
    });
  } catch (error) {
    console.error("Get product by id error:", error);

    return res.status(500).json({
      message: "Something went wrong while fetching product.",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "category",
      "brand",
      "unit",
      "purchasePrice",
      "sellingPrice",
      "currentStock",
      "minStockLevel",
      "expiryDate",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        shopId: req.user.shopId,
        isActive: true,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      message: "Something went wrong while updating product.",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        shopId: req.user.shopId,
        isActive: true,
      },
      {
        isActive: false,
      },
      {
        new: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      message: "Something went wrong while deleting product.",
    });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      shopId: req.user.shopId,
      isActive: true,
      $expr: {
        $lte: ["$currentStock", "$minStockLevel"],
      },
    }).sort({ currentStock: 1 });

    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Low stock products error:", error);

    return res.status(500).json({
      message: "Something went wrong while fetching low stock products.",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
};