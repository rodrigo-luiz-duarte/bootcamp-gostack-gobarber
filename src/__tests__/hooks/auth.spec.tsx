import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";
import { AuthProvider, useAuth } from "../../hooks/auth";
import MockAdapter from "axios-mock-adapter";
import api from "../../services/api";

const apiMock = new MockAdapter(api);

describe("Auth hook", () => {
  it("Should be able to sign in", async () => {
    const apiResponse = {
      user: {
        id: "usuario-1234",
        name: "Teste da Silva",
        email: "teste@teste.com.br",
      },
      token: "token-do-usuario-1234",
    };

    apiMock.onPost("/sessions").reply(200, apiResponse);

    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signIn({
      email: "teste@teste.com.br",
      password: "12345678",
    });

    await waitForNextUpdate();

    expect(setItemSpy).toHaveBeenCalledWith(
      "@GoBarber:token",
      apiResponse.token
    );
    expect(setItemSpy).toHaveBeenCalledWith(
      "@GoBarber:user",
      JSON.stringify(apiResponse.user)
    );
    expect(result.current.user.email).toEqual("teste@teste.com.br");
  });

  it("Should be able to restore saved data from storage when auth inits", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      switch (key) {
        case "@GoBarber:token":
          return "token-do-usuario-1234";
        case "@GoBarber:user":
          return JSON.stringify({
            id: "usuario-1234",
            name: "Teste da Silva",
            email: "teste@teste.com.br",
          });
        default:
          return null;
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user.email).toEqual("teste@teste.com.br");
  });

  it("Should be able to sign out", async () => {
    const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");

    jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      switch (key) {
        case "@GoBarber:token":
          return "token-do-usuario-1234";
        case "@GoBarber:user":
          return JSON.stringify({
            id: "usuario-1234",
            name: "Teste da Silva",
            email: "teste@teste.com.br",
          });
        default:
          return null;
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.signOut();
    });

    expect(removeItemSpy).toHaveBeenCalledTimes(2);
    expect(result.current.user).toBeUndefined();
  });

  it("Should be able to update user data", () => {
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const user = {
      id: "usuario-1234",
      name: "Teste da Silva",
      email: "teste@teste.com.br",
      avatarUrl: "image-avatar.jpg",
    };

    act(() => {
      result.current.updateUser(user);
    });

    expect(setItemSpy).toHaveBeenCalledWith(
      "@GoBarber:user",
      JSON.stringify(user)
    );

    expect(result.current.user).toEqual(user);
  });
});
