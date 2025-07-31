import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 Main.tsx loaded - starting React app");
const rootElement = document.getElementById("root");
console.log("📍 Root element found:", rootElement);

if (rootElement) {
  createRoot(rootElement).render(<App />);
  console.log("✅ React app mounted successfully");
} else {
  console.error("❌ Root element not found!");
}
