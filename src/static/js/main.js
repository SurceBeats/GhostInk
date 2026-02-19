import { createElement } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("root");
  const root = createRoot(container);
  root.render(createElement(App, { username: container.dataset.username || "" }));
});
