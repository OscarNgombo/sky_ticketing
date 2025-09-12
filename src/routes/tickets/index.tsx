import { createFileRoute } from "@tanstack/react-router";
import TicketsPage from "../../features/tickets/pages/TicketsPage";

export const Route = createFileRoute("/tickets/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TicketsPage />;
}
