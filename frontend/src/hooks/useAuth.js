import { useState, useEffect } from "react";
import { clearAllAuthState } from "../utils/msalConfig";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on component mount
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("userData");

        if (token && userData) {
          const parsedUserData = JSON.parse(userData);
          setUser(parsedUserData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData, token) => {
    try {
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("name", userData.name);
      localStorage.setItem("token", token);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const logout = () => {
    try {
      clearAllAuthState();
      setUser(null);
      setIsAuthenticated(false);
      // Redirect to login page
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};
