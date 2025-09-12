import { createFileRoute } from "@tanstack/react-router";
import TicketPage from "../features/tickets/pages/TicketPage";

export const Route = createFileRoute("/createTicket")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TicketPage />;
}
