import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// Token → Tailwind pipeline (same stylesheet the pure-CSS page uses).
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
