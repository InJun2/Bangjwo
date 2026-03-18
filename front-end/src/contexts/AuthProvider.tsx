import { ReactNode, useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import { DecodedJwtPayload, getUserFromToken } from "../utils/jwt";
import { AuthStatus } from "../types/authTypes";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedJwtPayload | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");

    if (storedToken) {
      try {
        const decodedUser = getUserFromToken(storedToken);
        setAccessToken(storedToken);
        setUser(decodedUser);
        setStatus("authenticated");
      } catch (error) {
        console.error("Failed to decode or load token:", error);
        localStorage.removeItem("accessToken");
        setAccessToken(null);
        setUser(null);
        setStatus("unauthenticated");
      }
    } else {
      setStatus("unauthenticated");
    }
  }, []);

  const login = (accessToken: string) => {
    const decodedUser = getUserFromToken(accessToken);
    localStorage.setItem("accessToken", accessToken);
    setAccessToken(accessToken);
    setUser(decodedUser);
    setStatus("authenticated");
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");

    window.location.replace("/");
  };

  return (
    <AuthContext.Provider value={{ status, accessToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
