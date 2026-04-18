import { createContext, useContext } from "react";

export type AppPaths = {
  authLogin: string;
  authRegister: string;
  mainSwipe: string;
  liked: string;
  finish: string;
  settings: string;
  admin: string;
};

export const defaultAppPaths: AppPaths = {
  authLogin: "/auth/login",
  authRegister: "/auth/register",
  mainSwipe: "/swipe",
  liked: "/liked",
  finish: "/finish",
  settings: "/settings",
  admin: "/admin"
};

const AppPathsContext = createContext<AppPaths>(defaultAppPaths);

export const AppPathsProvider = AppPathsContext.Provider;

export const useAppPaths = () => useContext(AppPathsContext);
