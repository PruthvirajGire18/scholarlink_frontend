import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginAPI, signupAPI } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const id = localStorage.getItem("user_id");
    const name = localStorage.getItem("user_name");
    const email = localStorage.getItem("user_email");
    if (token && role) {
      setUser({ id, role, name, email });
    }
  }, []);

  const login = async (formData) => {
    const response = await loginAPI(formData);
    localStorage.setItem("token", response.token);
    localStorage.setItem("role", response.role);
    localStorage.setItem("user_id", response.user?.id || "");
    localStorage.setItem("user_name", response.user?.name || "");
    localStorage.setItem("user_email", response.user?.email || "");

    const currentUser = {
      id: response.user?.id,
      role: response.role,
      name: response.user?.name,
      email: response.user?.email
    };
    setUser(currentUser);
    return currentUser;
  };

  const signup = async (formData) => signupAPI(formData);

  const logout = () => {
    const lang = localStorage.getItem("app_lang");
    const voiceHints = localStorage.getItem("app_voice_hints");
    const accessibilityMode = localStorage.getItem("app_accessibility_mode");
    const speechRate = localStorage.getItem("app_speech_rate");
    localStorage.clear();
    if (lang) localStorage.setItem("app_lang", lang);
    if (voiceHints) localStorage.setItem("app_voice_hints", voiceHints);
    if (accessibilityMode) localStorage.setItem("app_accessibility_mode", accessibilityMode);
    if (speechRate) localStorage.setItem("app_speech_rate", speechRate);
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, signup, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
