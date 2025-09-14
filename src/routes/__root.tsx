import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <div style={{ color: "red", margin: "0 auto" }}>404</div>
  ),
  
});
