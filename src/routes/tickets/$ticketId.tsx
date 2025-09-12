import { createFileRoute } from '@tanstack/react-router';
import TicketDetailPage from '../../features/tickets/pages/TicketDetailPage';

export const Route = createFileRoute('/tickets/$ticketId')({
  component: RouteComponent,
});

function RouteComponent() {
  return <TicketDetailPage />;
}
