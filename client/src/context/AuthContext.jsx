import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("stayease_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("stayease_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me").then(({ data }) => {
      setUser(data.user);
      localStorage.setItem("stayease_user", JSON.stringify(data.user));
    }).catch(() => {
      localStorage.removeItem("stayease_token");
      localStorage.removeItem("stayease_user");
      setUser(null);
    }).finally(() => setLoading(false));
  }, []);

  const login = async (credentials, mode = "login") => {
    const { data } = await api.post(`/auth/${mode}`, credentials);
    localStorage.setItem("stayease_token", data.token);
    localStorage.setItem("stayease_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem("stayease_token");
    localStorage.removeItem("stayease_user");
    setUser(null);
  };
  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
