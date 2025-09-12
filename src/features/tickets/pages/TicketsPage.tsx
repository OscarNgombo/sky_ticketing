import React, { useState, useEffect, useMemo } from "react";
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
import Button from "../../../shared/components/buttons/Button";
import MainLayout from "../shared/layouts/MainLayout";
import Modal from "../../../shared/components/modal/Modal";
import Table from "../components/Table";
import TicketSummary from "../components/TicketSummary";
import { useNavigate } from "@tanstack/react-router";

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
  const [filter, setFilter] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summaryFilter, setSummaryFilter] = useState("all");
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
    console.log("Selected filter:", e.target.value);
  };

  const handleSummaryFilterChange = (status: string) => {
    setSummaryFilter(status);
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

      const displayTickets = parsedTickets.map((ticket) => ({
        id: ticket.id.toString(),
        subject: ticket.problem,
        status: "Open",
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
          const ticketValue = ticket[filter.field as keyof Ticket];
          if (typeof ticketValue !== "string") return false;

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

  const ticketStatusOptions = useMemo(
    () => ["Apstar SACCO", "Mwalimu SACCO", "Defence SACCO", "Wetu SACCO"],
    []
  );

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

  const rightNavItems = useMemo(
    () => [
      <div
        key="add"
        onClick={() => navigate({ to: "/createTicket" })}
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
      <Dropdown
        key="sacco-filter"
        options={ticketStatusOptions}
        value={filter}
        onChange={handleFilterChange}
        placeholder="Apstar SACCO Limited"
        showIcon={false}
      />,
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
      </div>,
    ],
    [filter, navigate, ticketStatusOptions]
  );

  return (
    <>
      <MainLayout
        leftText={props.user?.company || "Help Desk"}
        leftButtonText={props.user?.userType || "VENDOR"}
        userType={props.user?.userType || "Vendor"}
        username={props.user?.username || "Guest"}
        rightItems={rightNavItems}
        mainContentClassName="tickets-page"
      >
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
          onSelectStatus={handleSummaryFilterChange}
        />
        <div className="ticket-list-container">
          <Table
            columns={ticketColumns}
            data={processedTickets}
            showFilter={true}
            showSort={true}
            onFilter={setFilters}
            onSort={setSorts}
            initialFilters={filters}
            initialSorts={sorts}
            showRefresh={true}
            onRefresh={handleRefresh}
            onRowClick={(row) => {
              try {
                const encoded = btoa(String(row.id));
                navigate({ to: `/tickets/${encoded}` });
              } catch {
                // fallback to plain id if encoding fails
                navigate({ to: `/tickets/${row.id}` });
              }
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
      </MainLayout>
    </>
  );
}

export default TicketsPage;
