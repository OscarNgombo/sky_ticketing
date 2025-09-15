import {useMemo, useRef, useState, useEffect} from "react";
import {
    AddIcon,
    SearchIcon,
    NotificationIcon,
    UserIcon,
} from "../../../shared/icons/icons";
import Dropdown from "../components/Dropdown";

import {useNavigate} from "@tanstack/react-router";
import {decryptData} from "../../../utils/crypto";
import Table from "../components/Table";
import type {Column} from "../components/Table";
import "../styles/Dashboard.css";
import Button from "../../../shared/components/buttons/Button";
import {useSetLayout} from "../../../shared/layouts/LayoutContext";
import { getCurrentUser } from "../../../utils/auth";

interface TicketPageProps {
    user?: {
        username: string;
        userType: string;
        company: string;
    };
}

interface TicketRow {
    id: string;
    subject: string;
    status: string;
    source: string;
    date: string;
}

function Dashboard({user}: TicketPageProps) {
    const navigate = useNavigate();
    const navigateRef = useRef(navigate);
    useEffect(() => { navigateRef.current = navigate; }, [navigate]);

    const currentUser = user ?? getCurrentUser() ?? undefined;
    const isVendor = (currentUser?.userType || '').toLowerCase() === 'vendor';
    const [filter, setFilter] = useState('');

    const rightNavItems = useMemo(
        () => {
            const items: React.ReactNode[] = [
                <div key="add" onClick={() => navigateRef.current({to: "/createTicket"})} style={{cursor: 'pointer'}}><AddIcon/></div>,
                <div key="search" title="Coming Soon" style={{cursor: 'pointer'}}><SearchIcon/></div>,
            ];
            if (isVendor) {
                items.push(
                    <Dropdown
                        key="sacco-filter"
                        options={["Apstar SACCO", "Mwalimu SACCO", "Defence SACCO", "Wetu SACCO"]}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Apstar SACCO Limited"
                        showIcon={false}
                    />
                );
            }
            items.push(
                <div key="notifications" title="Coming Soon" style={{cursor: 'pointer'}}><NotificationIcon/></div>,
                <div key="user" title="Coming Soon" style={{cursor: 'pointer'}}><UserIcon/></div>,
            );
            return items;
        },
        [filter, isVendor]
    );

    useSetLayout({
        leftText: currentUser?.company || "Help Desk",
        leftButtonText: currentUser?.userType || "CLIENT",
        rightItems: rightNavItems,
        mainContentClassName: "ticket-page",
    });

    type TicketRecord = {
        id: number | string;
        problem?: string;
        status?: string;
        source?: string;
        createdAt?: string;
    } & Record<string, unknown>;
    const ticketsDataRaw: TicketRecord[] = (() => {
        try {
            const enc = localStorage.getItem("tickets");
            if (!enc) return [] as TicketRecord[];
            const dec = decryptData(enc);
            return dec ? (JSON.parse(dec) as TicketRecord[]) : [];
        } catch {
            return [] as TicketRecord[];
        }
    })();

    // Role-based visibility: clients only see their company tickets
    const currentCompany = currentUser?.company;
    const visibleTickets: TicketRecord[] = !isVendor && currentCompany
        ? ticketsDataRaw.filter((t: any) => (t.company && t.company === currentCompany) || (typeof t.source === 'string' && t.source.includes(currentCompany)))
        : ticketsDataRaw;

    const totalTickets = visibleTickets.length;
    const openTickets = visibleTickets.filter(
        (t) => (t.status ?? "Open") === "Open"
    ).length;
    const closedTickets = visibleTickets.filter(
        (t) => (t.status ?? "Open") === "Closed"
    ).length;

    const recentTickets: TicketRow[] = (visibleTickets || [])
        .slice(-10)
        .reverse()
        .map((t: TicketRecord) => ({
            id: String(t.id),
            subject: t.problem as string,
            status: (t.status as string) || "Open",
            source: (t.source as string) || "Unknown",
            date: t.createdAt ? new Date(String(t.createdAt)).toLocaleString() : "",
        }));

    const ticketColumns: Column<TicketRow>[] = [
        {header: "Ticket ID", accessor: "id"},
        {header: "Subject", accessor: "subject"},
        {header: "Status", accessor: "status"},
        {header: "Source", accessor: "source"},
        {header: "Date Created", accessor: "date"},
    ];

    return (
        <div className="dashboard-grid">
            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-title">Total Tickets</div>
                    <div className="stat-value">{totalTickets}</div>
                </div>
                <div className="stat-card open">
                    <div className="stat-title">Open</div>
                    <div className="stat-value">{openTickets}</div>
                </div>
                <div className="stat-card closed">
                    <div className="stat-title">Closed</div>
                    <div className="stat-value">{closedTickets}</div>
                </div>
                <div className="stat-card assigned">
                    <div className="stat-title">Assigned To Me</div>
                    <div className="stat-value">0</div>
                </div>
            </div>

            <div className="dashboard-actions">
                <Button
                    variant="primary"
                    onClick={() => {
                        navigate({to: "/createTicket"});
                    }}
                >
                    Create Ticket
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => {
                        navigate({to: "/tickets"});
                    }}
                >
                    View All Tickets
                </Button>
            </div>

            <div className="dashboard-recent">
                <h3>Recent Tickets</h3>
                <div className="recent-table table-full-window dashboard-table">
                    <Table columns={ticketColumns} data={recentTickets} showRefresh={false}/>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
