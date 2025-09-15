import {createFileRoute} from '@tanstack/react-router'
import Dashboard from "../../features/tickets/pages/Dashboard.tsx";

export const Route = createFileRoute('/_authenticated/dashboard')({
    component: RouteComponent,
})

function RouteComponent() {
    return <Dashboard/>
}
