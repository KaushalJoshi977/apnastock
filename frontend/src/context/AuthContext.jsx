import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("apnastock_token");
    const savedUser = localStorage.getItem("apnastock_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setAuthLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("apnastock_token", token);
    localStorage.setItem("apnastock_user", JSON.stringify(user));

    setToken(token);
    setUser(user);

    return response.data;
  };

const register = async (formData) => {
  const response = await axiosInstance.post("/auth/register", formData);
  return response.data;
};

  const logout = () => {
    localStorage.removeItem("apnastock_token");
    localStorage.removeItem("apnastock_user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: Boolean(token),
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};