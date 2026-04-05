import { createContext, useContext, type ReactNode } from "react"

import { ApplicationStore } from "./applicationStore"

const StoreContext = createContext<ApplicationStore | null>(null)

export function StoreProvider({
  store,
  children,
}: {
  store: ApplicationStore
  children: ReactNode
}) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): ApplicationStore {
  const ctx = useContext(StoreContext)
  if (!ctx) {
    throw new Error("useStore должен вызываться внутри StoreProvider")
  }
  return ctx
}
