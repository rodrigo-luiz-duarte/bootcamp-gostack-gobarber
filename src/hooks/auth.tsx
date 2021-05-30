import React, { createContext, useCallback, useState, useContext } from "react";
import api from "../services/api";

interface SignInCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  avatarUrl: string;
  name: string;
  email: string;
}
interface AuthContextData {
  user: User;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  updateUser(user: User): void;
}

interface AuthState {
  token: string;
  user: User;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const SESSION_STORAGE_TOKEN = "@GoBarber:token";
const SESSION_STORAGE_USER = "@GoBarber:user";

export const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = sessionStorage.getItem(SESSION_STORAGE_TOKEN);
    const user = sessionStorage.getItem(SESSION_STORAGE_USER);

    if (token && user) {
      api.defaults.headers.authorization = `Bearer ${token}`;
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

    const { token, user } = response.data;

    sessionStorage.setItem(SESSION_STORAGE_TOKEN, token);
    sessionStorage.setItem(SESSION_STORAGE_USER, JSON.stringify(user));

    api.defaults.headers.authorization = `Bearer ${token}`;

    setData({ token, user });
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_TOKEN);
    sessionStorage.removeItem(SESSION_STORAGE_USER);

    setData({} as AuthState);
  }, []);

  const updateUser = useCallback(
    (user: User) => {
      setData({
        token: data.token,
        user,
      });

      sessionStorage.setItem(SESSION_STORAGE_USER, JSON.stringify(user));
    },
    [data.token, setData]
  );

  return (
    <AuthContext.Provider
      value={{ user: data.user, signIn, signOut, updateUser }}
    >
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
