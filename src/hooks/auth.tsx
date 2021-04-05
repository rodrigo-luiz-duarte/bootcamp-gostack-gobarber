import React, { createContext, useCallback, useState, useContext } from "react";
import api from "../services/api";

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: object;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
}

interface AuthState {
  token: string;
  user: object;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const SESSION_STORAGE_TOKEN = "@GoBarber:token";
const SESSION_STORAGE_USER = "@GoBarber:user";

export const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = sessionStorage.getItem(SESSION_STORAGE_TOKEN);
    const user = sessionStorage.getItem(SESSION_STORAGE_USER);

    if (token && user) {
      return { token, user: JSON.parse(user) };
    } else {
      return {} as AuthState;
    }
  });

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post("sessions", {
      email,
      password,
    });

    console.log(response.data);

    const { token, userWithoutPassword: user } = response.data;

    sessionStorage.setItem(SESSION_STORAGE_TOKEN, token);
    sessionStorage.setItem(SESSION_STORAGE_USER, JSON.stringify(user));

    setData({ token, user });
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_TOKEN);
    sessionStorage.removeItem(SESSION_STORAGE_USER);

    setData({} as AuthState);
  }, []);

  return (
    <AuthContext.Provider value={{ user: data.user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
