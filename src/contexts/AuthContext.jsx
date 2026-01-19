import { createContext, useContext, useState, useEffect } from "react";
import { loginAPI, signupAPI } from "../services/authService";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      setUser({ role });
    }
  }, []);

  const login = async (formData) => {
    const res = await loginAPI(formData);
    localStorage.setItem("token", res.token);
    localStorage.setItem("role", res.role);
    setUser({ role: res.role });
    return res.role;
  };

  const signup = async (formData) => {
    await signupAPI(formData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
