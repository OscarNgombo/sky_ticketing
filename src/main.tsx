import React from "react";

import "./index.css";
import { routeTree } from "./routeTree.gen";
import { RouterProvider, Router } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

const router = new Router({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
