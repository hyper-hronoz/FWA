import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ApplicationStore } from "./state/applicationStore"
import { StoreProvider } from "./state/storeContext"

const appStore = new ApplicationStore()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider store={appStore}>
      <App />
    </StoreProvider>
  </StrictMode>
)
