import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {adminApi} from "../services/api";
import {isTokenExpired, isValidJWT, debugToken} from "../utils/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{success: boolean; error?: string}>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for existing token on app startup
    const storedToken = localStorage.getItem("adminToken");

    console.log("AuthContext: Checking stored token on startup");
    if (storedToken) {
      debugToken(storedToken);
    } else {
      console.log("AuthContext: No token found in localStorage");
    }

    if (
      storedToken &&
      isValidJWT(storedToken) &&
      !isTokenExpired(storedToken)
    ) {
      setToken(storedToken);
      setIsAuthenticated(true);
      console.log("AuthContext: Token is valid, user authenticated");
    } else if (storedToken) {
      // Token is invalid or expired, remove it
      localStorage.removeItem("adminToken");
      console.log(
        "AuthContext: Token is invalid/expired, removed from storage"
      );
    }
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{success: boolean; error?: string}> => {
    try {
      console.log("AuthContext: Attempting login...");
      const response = await adminApi.login({email, password});
      console.log("AuthContext: Login response received:", response);

      // Handle direct token response (your backend format)
      const rawToken = response.token;
      const token = rawToken?.trim(); // Clean any whitespace
      console.log(
        "AuthContext: Extracted token:",
        token ? `Token received (${token.substring(0, 20)}...)` : "No token"
      );

      if (token) {
        console.log("AuthContext: Saving clean token to localStorage...");
        localStorage.setItem("adminToken", token);
        setToken(token);
        setIsAuthenticated(true);

        // Debug the saved token
        debugToken(token);
        console.log("AuthContext: Login successful, user authenticated");

        return {success: true};
      }
      return {success: false, error: "No token received from server"};
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      return {success: false, error: errorMessage};
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    isAuthenticated,
    token,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
