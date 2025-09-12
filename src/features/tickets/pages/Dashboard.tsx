import {
  AddIcon,
  SearchIcon,
  NotificationIcon,
  UserIcon,
} from "../../../shared/icons/icons";
import MainLayout from "../shared/layouts/MainLayout";
import { useNavigate } from "@tanstack/react-router";
import { decryptData } from "../../../utils/crypto";
import Table from "../components/Table";
import type { Column } from "../components/Table";
import "../styles/Dashboard.css";
import Button from "../../../shared/components/buttons/Button";

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

function Dashboard({ user }: TicketPageProps) {
  const rightNavItems = [
    <AddIcon />,
    <SearchIcon />,
    <NotificationIcon />,
    <UserIcon />,
  ];

  // Lightweight demo stats (derived from local storage tickets if available)
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

  const totalTickets = ticketsDataRaw.length;
  const openTickets = ticketsDataRaw.filter(
    (t) => (t.status ?? "Open") === "Open"
  ).length;
  const closedTickets = ticketsDataRaw.filter(
    (t) => (t.status ?? "Open") === "Closed"
  ).length;

  const recentTickets: TicketRow[] = (ticketsDataRaw || [])
    .slice(-10)
    .reverse()
    .map((t: TicketRecord) => ({
      id: String(t.id),
      subject: t.problem as string,
      status: t.status || "Open",
      source: (t.source as string) || "Unknown",
      date: t.createdAt ? new Date(String(t.createdAt)).toLocaleString() : "",
    }));

  const ticketColumns: Column<TicketRow>[] = [
    { header: "Ticket ID", accessor: "id" },
    { header: "Subject", accessor: "subject" },
    { header: "Status", accessor: "status" },
    { header: "Source", accessor: "source" },
    { header: "Date Created", accessor: "date" },
  ];

  const navigate = useNavigate();
  return (
    <MainLayout
      leftText={user?.company || "Help Desk"}
      leftButtonText={user?.userType || "CLIENT"}
      userType={user?.userType || "Client"}
      username={user?.username || "Guest"}
      rightItems={rightNavItems}
      mainContentClassName="ticket-page"
    >
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
              navigate({ to: "/tickets/createTicket" });
            }}
          >
            Create Ticket
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              navigate({ to: "/tickets" });
            }}
          >
            View All Tickets
          </Button>
        </div>

        <div className="dashboard-recent">
          <h3>Recent Tickets</h3>
          <div className="recent-table table-full-window dashboard-table">
            <Table
              columns={ticketColumns}
              data={recentTickets}
              showRefresh={false}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
