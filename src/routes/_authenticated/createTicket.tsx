import { createFileRoute } from '@tanstack/react-router'
import TicketPage from '../../features/tickets/pages/TicketPage'

export const Route = createFileRoute('/_authenticated/createTicket')({
  component: () => <TicketPage />,
})

