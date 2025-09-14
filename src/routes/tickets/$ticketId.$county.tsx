import { createFileRoute } from "@tanstack/react-router";
import TicketDetailPage from "../../features/tickets/pages/TicketDetailPage";

export const Route = createFileRoute("/tickets/$ticketId/$county")({
  component: RouteComponent,
});

function RouteComponent() {
  // const params = Route.useParams();
  // params.county = params.county();
  return <TicketDetailPage />;
}
