import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import Input from "../../components/Input";

jest.mock("@unform/core", () => {
  return {
    useField() {
      return {
        fieldName: "email",
        defaultValue: "",
        error: "",
        registerField: jest.fn(),
      };
    },
  };
});

describe("Input component", () => {
  it("Should be able to render a input", () => {
    const { getByPlaceholderText } = render(
      <Input name="email" placeholder="E-mail" />
    );

    expect(getByPlaceholderText("E-mail")).toBeTruthy();
  });

  it("Should be able to highlight on input focus", async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <Input name="email" placeholder="E-mail" />
    );

    const inputElement = getByPlaceholderText("E-mail");
    const inputContainer = getByTestId("input-container");

    fireEvent.focus(inputElement);

    await waitFor(() => {
      expect(inputContainer).toHaveStyle("border-color: #ff9000;");
      expect(inputContainer).toHaveStyle("color: #ff9000;");
    });

    fireEvent.blur(inputElement);

    await waitFor(() => {
      expect(inputContainer).not.toHaveStyle("border-color: #ff9000;");
      expect(inputContainer).not.toHaveStyle("color: #ff9000;");
    });
  });

  it("Should be able to highlight when input is filled", async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <Input name="email" placeholder="E-mail" />
    );

    const inputElement = getByPlaceholderText("E-mail");
    const inputContainer = getByTestId("input-container");

    fireEvent.change(inputElement, {
      target: {
        value: "teste@teste.com.br",
      },
    });

    fireEvent.blur(inputElement);

    await waitFor(() => {
      expect(inputContainer).toHaveStyle("color: #ff9000;");
    });
  });
});
