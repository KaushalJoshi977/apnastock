const attachShopContext = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  const shopId = req.headers["x-shop-id"];
  const role = req.headers["x-user-role"];

  if (!userId || !shopId) {
    return res.status(401).json({
      message: "Unauthorized request. Shop context missing.",
    });
  }

  req.user = {
    userId,
    shopId,
    role,
  };

  next();
};

module.exports = attachShopContext;