import {createFileRoute} from '@tanstack/react-router'
import TicketsPage from "../../../features/tickets/pages/TicketsPage.tsx";

export const Route = createFileRoute('/_authenticated/tickets/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <TicketsPage/>
}
