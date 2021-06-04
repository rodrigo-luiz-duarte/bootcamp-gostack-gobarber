import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import SignIn from "../../pages/SignIn";

const mockedHistoryPush = jest.fn();
const mockedSignIn = jest.fn();
const mockedAddToast = jest.fn();

jest.mock("react-router-dom", () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    Link: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock("../../hooks/auth.tsx", () => {
  return {
    useAuth: () => ({
      signIn: mockedSignIn,
    }),
  };
});

jest.mock("../../hooks/toast.tsx", () => {
  return {
    useToast: () => ({
      addToast: mockedAddToast,
    }),
  };
});

describe("SignIn Page", () => {
  beforeEach(() => {
    mockedHistoryPush.mockClear();
  });

  it("Should be able to sign in", async () => {
    const { getByPlaceholderText, getByText } = render(<SignIn />);

    const emailField = getByPlaceholderText("E-mail");
    const passwordField = getByPlaceholderText("Senha");
    const buttonElement = getByText("Entrar");

    fireEvent.change(emailField, { target: { value: "rodrigo@teste.com.br" } });
    fireEvent.change(passwordField, { target: { value: "12345678" } });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(mockedHistoryPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("Should not be able to sign in with invalid credentials", async () => {
    const { getByPlaceholderText, getByText } = render(<SignIn />);

    const emailField = getByPlaceholderText("E-mail");
    const passwordField = getByPlaceholderText("Senha");
    const buttonElement = getByText("Entrar");

    fireEvent.change(emailField, { target: { value: "not-valid-email" } });
    fireEvent.change(passwordField, { target: { value: "12345678" } });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalledWith("/dashboard");
    });
  });

  it("Should be able to show a message when login fails", async () => {
    mockedSignIn.mockImplementation(() => {
      throw new Error();
    });

    const { getByPlaceholderText, getByText } = render(<SignIn />);

    const emailField = getByPlaceholderText("E-mail");
    const passwordField = getByPlaceholderText("Senha");
    const buttonElement = getByText("Entrar");

    fireEvent.change(emailField, { target: { value: "rodrigo@teste.com.br" } });
    fireEvent.change(passwordField, { target: { value: "12345678" } });
    fireEvent.click(buttonElement);

    await waitFor(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" })
      );
    });
  });
});
