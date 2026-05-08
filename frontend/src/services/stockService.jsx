import axiosInstance from "../api/axiosInstance";

export const stockIn = async (stockData) => {
  const response = await axiosInstance.post("/stock/in", stockData);
  return response.data;
};

export const stockOut = async (stockData) => {
  const response = await axiosInstance.post("/stock/out", stockData);
  return response.data;
};

export const adjustStock = async (stockData) => {
  const response = await axiosInstance.post("/stock/adjust", stockData);
  return response.data;
};

export const getStockTransactions = async ({ productId = "", type = "" } = {}) => {
  const params = new URLSearchParams();

  if (productId) params.append("productId", productId);
  if (type) params.append("type", type);

  const queryString = params.toString();

  const response = await axiosInstance.get(
    queryString ? `/stock/transactions?${queryString}` : "/stock/transactions"
  );

  return response.data;
};