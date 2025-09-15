import React, { useState, useEffect, useMemo, useRef } from "react";
import CryptoJS from "crypto-js";
import "../styles/TicketsPage.css";
import Dropdown from "../components/Dropdown";
import {
  AddIcon,
  SearchIcon,
  NotificationIcon,
  UserIcon,
} from "../../../shared/icons/icons";
import type { Column } from "../components/Table";
import Modal from "../../../shared/components/modal/Modal";
import Table from "../components/Table";
import TicketSummary from "../components/TicketSummary";
import { useNavigate } from "@tanstack/react-router";
import Button from "../../../shared/components/buttons/Button";
import { useSetLayout } from "../../../shared/layouts/LayoutContext";
import { getCurrentUser } from "../../../utils/auth";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  source: string;
  date: string;
}

interface StoredTicket {
  id: number;
  mainCategory: string;
  subCategory: string;
  problem: string;
  description: string;
  source: string;
  files: File[];
  createdAt: string;
}

interface TicketsPageProps {
  user?: {
    username: string;
    userType: string;
    company: string;
  };
}

function TicketsPage(props: TicketsPageProps) {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);
  const [filter, setFilter] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summaryFilter, setSummaryFilter] = useState("all");

  const currentUser = props.user ?? getCurrentUser() ?? undefined;
  const isVendor = (currentUser?.userType || "").toLowerCase() === "vendor";

  type Filter = {
    field: keyof Ticket;
    operator: "contains" | "is" | "is_not" | "starts_with" | "ends_with";
    value: string;
  };
  const [filters, setFilters] = useState<Filter[]>([]);
  interface Sort {
    field: keyof Ticket;
    direction: "asc" | "desc";
  }
  const [sorts, setSorts] = useState<Sort[]>([]);

  const rightNavItems = useMemo(() => {
    const baseItems: React.ReactNode[] = [
      <div
        key="add"
        onClick={() => navigateRef.current({ to: "/createTicket" })}
        style={{ cursor: "pointer" }}
      >
        <AddIcon />
      </div>,
      <div
        key="search"
        onClick={() => setIsModalOpen(true)}
        style={{ cursor: "pointer" }}
        title="Coming Soon"
      >
        <SearchIcon />
      </div>,
    ];

    // Vendors get SACCO dropdown filter in the header
    if (isVendor) {
      baseItems.push(
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

    baseItems.push(
      <div
        key="notifications"
        onClick={() => setIsModalOpen(true)}
        style={{ cursor: "pointer" }}
        title="Coming Soon"
      >
        <NotificationIcon />
      </div>,
      <div
        key="user"
        onClick={() => setIsModalOpen(true)}
        style={{ cursor: "pointer" }}
        title="Coming Soon"
      >
        <UserIcon />
      </div>
    );

    return baseItems;
  }, [filter, isVendor]);

  useSetLayout({
    leftText: currentUser?.company || "Help Desk",
    leftButtonText: currentUser?.userType || "Client",
    rightItems: rightNavItems,
    mainContentClassName: "tickets-page",
  });

  // Helper: serialize filters/sorts into URL (encode ticket id values using base64)
  const syncUrl = React.useCallback(
    (nextFilters: Filter[], nextSorts: Sort[]) => {
      const encFilters = nextFilters.map((f) => ({
        ...f,
        value: f.field === "id" ? btoa(f.value) : f.value,
      }));
      const qs = new URLSearchParams();
      if (encFilters.length)
        qs.set("filters", encodeURIComponent(JSON.stringify(encFilters)));
      if (nextSorts.length)
        qs.set("sorts", encodeURIComponent(JSON.stringify(nextSorts)));
      const base = window.location.pathname;
      navigate({ to: base + (qs.toString() ? `?${qs.toString()}` : "") });
    },
    [navigate]
  );

  // Helper: read filters/sorts from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get("filters");
    const s = params.get("sorts");
    if (f) {
      try {
        type ParsedFilter = { field: string; operator: string; value: string };
        const parsed = JSON.parse(decodeURIComponent(f)) as ParsedFilter[];
        const decFilters: Filter[] = parsed.map((pf) => ({
          field: pf.field as keyof Ticket,
          operator: pf.operator as Filter["operator"],
          value: pf.field === "id" ? atob(pf.value) : pf.value,
        }));
        setFilters(decFilters);
      } catch {
        /* ignore */
      }
    }
    if (s) {
      try {
        const parsedS = JSON.parse(decodeURIComponent(s));
        setSorts(parsedS as Sort[]);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const handleCreateTicket = () => {
    navigate({ to: "/createTicket" });
  };

  // When filters or sorts change, sync to URL
  useEffect(() => {
    syncUrl(filters, sorts);
  }, [filters, sorts, syncUrl]);

  useEffect(() => {
    loadStoredTickets();
  }, []);

  const loadStoredTickets = () => {
    const TICKET_SECRET = "skyworld_ticket_secret_2025";
    const storedTicketsData = localStorage.getItem("tickets");
    if (storedTicketsData) {
      let parsedTickets: StoredTicket[] = [];
      try {
        const decrypted = CryptoJS.AES.decrypt(
          storedTicketsData,
          TICKET_SECRET
        ).toString(CryptoJS.enc.Utf8);
        if (decrypted) {
          parsedTickets = JSON.parse(decrypted);
        }
      } catch (err) {
        console.error("Failed to decrypt or parse tickets:", err);
      }

      // Role-based visibility: clients only see their company tickets
      const filteredTickets = !isVendor && currentUser?.company
        ? parsedTickets.filter((t: any) => (t.company && t.company === currentUser.company) || (typeof t.source === 'string' && t.source.includes(currentUser.company)))
        : parsedTickets;

      const displayTickets = filteredTickets.map((ticket: any) => ({
        id: String(ticket.id),
        subject: ticket.problem,
        status: ticket.status || "Open",
        source: ticket.source,
        date: new Date(ticket.createdAt).toLocaleString(),
      }));

      setTickets(
        displayTickets.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    } else {
      setTickets([]);
    }
  };

  const handleRefresh = async () => {
    // simulate async refresh and reload stored tickets
    await new Promise((res) => setTimeout(res, 250));
    loadStoredTickets();
  };

  const processedTickets = useMemo(() => {
    let filtered = tickets;

    if (summaryFilter !== "all") {
      filtered = filtered.filter(
        (ticket) => ticket.status.toLowerCase() === summaryFilter
      );
    }

    if (filters.length > 0) {
      filtered = filtered.filter((ticket) => {
        return filters.every((filter) => {
          const ticketValue = ticket[filter.field as keyof Ticket] as string;

          switch (filter.operator) {
            case "contains":
              return ticketValue
                .toLowerCase()
                .includes(filter.value.toLowerCase());
            case "is":
              return ticketValue.toLowerCase() === filter.value.toLowerCase();
            case "is_not":
              return ticketValue.toLowerCase() !== filter.value.toLowerCase();
            case "starts_with":
              return ticketValue
                .toLowerCase()
                .startsWith(filter.value.toLowerCase());
            case "ends_with":
              return ticketValue
                .toLowerCase()
                .endsWith(filter.value.toLowerCase());
            default:
              return true;
          }
        });
      });
    }

    if (sorts.length > 0) {
      filtered.sort((a, b) => {
        for (const sort of sorts) {
          const aValue = a[sort.field as keyof Ticket];
          const bValue = b[sort.field as keyof Ticket];

          if (aValue < bValue) {
            return sort.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sort.direction === "asc" ? 1 : -1;
          }
        }
        return 0;
      });
    }

    return filtered;
  }, [tickets, summaryFilter, filters, sorts]);

  const ticketColumns: Column<Ticket>[] = useMemo(
    () => [
      { header: "Ticket ID", accessor: "id" },
      {
        header: "Ticket Subject",
        accessor: "subject",
        cell: (value) => <span className="ticket-subject-cell">{value}</span>,
      },
      { header: "Ticket Status", accessor: "status" },
      { header: "Source", accessor: "source" },
      { header: "Date Created", accessor: "date" },
    ],
    []
  );

  return (
    <>
      <div className="ticketSummary">
        <p>All Tickets</p>
      </div>
      <div className="addTicketing">
        <p>All Tickets</p>
        <Button onClick={handleCreateTicket} variant="primary">
          Add Ticket
        </Button>
      </div>
      <TicketSummary
        tickets={tickets}
        onSelectStatus={setSummaryFilter}
      />
      <div className="ticket-list-container">
        <Table
          columns={ticketColumns}
          data={processedTickets}
          showFilter={true}
          showSort={true}
          onFilter={(next) => setFilters(next)}
          onSort={(next) => setSorts(next)}
          initialFilters={filters}
          initialSorts={sorts}
          showRefresh={true}
          onRefresh={handleRefresh}
          onRowClick={(row) => {
            navigate({ to: "/tickets/$ticketId", params: { ticketId: String(row.id) } });
          }}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Feature Update"
      >
        <p>This feature is coming soon. Stay tuned!</p>
      </Modal>
    </>
  );
}

export default TicketsPage;
