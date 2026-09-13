import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./ds/index.css";
import "./app.css";

const root = document.getElementById("root");
if (root === null) throw new Error("#root not found");
createRoot(root).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
