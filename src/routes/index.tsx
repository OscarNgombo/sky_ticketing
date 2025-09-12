import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "../shared/components/pages/LoginPage";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LoginPage />;
}
