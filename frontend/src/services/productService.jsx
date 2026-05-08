import axiosInstance from "../api/axiosInstance";

export const getProducts = async (search = "") => {
  const response = await axiosInstance.get(`/products?search=${search}`);
  return response.data;
};

export const getLowStockProducts = async () => {
  const response = await axiosInstance.get("/products/low-stock");
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axiosInstance.post("/products", productData);
  return response.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await axiosInstance.put(`/products/${productId}`, productData);
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await axiosInstance.delete(`/products/${productId}`);
  return response.data;
};