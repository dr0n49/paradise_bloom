import "@fontsource/outfit/400.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/outfit/800.css";
import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// Dev page for the character rig: ?qa=character (see src/qa/CharacterQA.tsx).
const CharacterQA = import.meta.env.DEV ? lazy(() => import("./qa/CharacterQA")) : null;
const qa = new URLSearchParams(location.search).get("qa");

createRoot(document.getElementById("root")!).render(
  import.meta.env.DEV && qa === "character" && CharacterQA ? (
    <Suspense fallback={null}>
      <CharacterQA />
    </Suspense>
  ) : (
    <App />
  ),
);
