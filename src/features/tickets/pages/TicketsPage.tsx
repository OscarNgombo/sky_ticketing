import React, { useState, useMemo, useRef, useEffect } from "react";
import "../styles/TicketsPage.css";
import Dropdown from "../components/Dropdown";
import {
  AddIcon,
  SearchIcon,
  NotificationIcon,
  UserIcon,
} from "../../../shared/icons/icons";
import { RefreshIcon } from "../../../shared/icons/TableIcons";
import type { Column } from "../components/table/Table";
import Modal from "../../../shared/components/modal/Modal";
import Table from "../components/table/Table";
import TicketSummary from "../components/TicketSummary";
import { useNavigate } from "@tanstack/react-router";
import Button from "../../../shared/components/buttons/Button";
import { useSetLayout } from "../../../shared/layouts/useSetLayout";
import { getCurrentUser, encodeTicketId } from "../../../utils/auth";
import TicketListComposer from "../composers/TicketListComposer";
import { useTicketList } from "../composers/useTicketList";
import type { Ticket } from "../composers/TicketListContext";

interface TicketsPageProps {
  user?: {
    username: string;
    userType: string;
    company?: string;
  };
}

export default function TicketsPage(props: TicketsPageProps) {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const [filter, setFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentUser = props.user ?? getCurrentUser() ?? undefined;
  const isVendor = (currentUser?.userType || "").toLowerCase() === "vendor";

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

    if (isVendor) {
      baseItems.push(
        <Dropdown
          key="sacco-filter"
          options={[
            "Apstar SACCO",
            "Mwalimu SACCO",
            "Defence SACCO",
            "Wetu SACCO",
          ]}
          value={filter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFilter(e.target.value)
          }
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

  const ticketColumns: Column<Ticket>[] = useMemo(
    () => [
      { header: "Ticket ID", accessor: "id" },
      {
        header: "Ticket Subject",
        accessor: "subject",
        cell: (value: string) => <span className="ticket-subject-cell">{value}</span>,
      },
      { header: "Ticket Status", accessor: "status" },
      { header: "Source", accessor: "source" },
      { header: "Date Created", accessor: "date" },
    ],
    []
  );

  const handleCreateTicket = () => navigate({ to: "/createTicket" });

  return (
    <>
      <div className="ticketSummary">
        <p>All Tickets</p>
      </div>

      <TicketListComposer
        columns={ticketColumns}
        initialFilters={[]}
        initialSorts={[]}
      >
        <InnerTicketArea
          onCreate={handleCreateTicket}
          columns={ticketColumns}
        />
      </TicketListComposer>

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

function InnerTicketArea({
  onCreate,
  columns,
}: {
  onCreate: () => void;
  columns: Column<Ticket>[];
}) {
  const {
    tickets,
    processedTickets,
    refresh,
    setSummaryFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
  } = useTicketList();

  return (
    <>
      <div className="addTicketing">
        <p>All Tickets</p>
        <Button onClick={onCreate} variant="primary">
          Add Ticket
        </Button>
      </div>

      <TicketSummary tickets={tickets} onSelectStatus={setSummaryFilter} />

      <div className="ticket-list-container">
        <Table
          columns={columns}
          data={processedTickets}
          // Deprecated boolean props removed. Use `actions` for customization.
          // Filters and sorts are handled via composer and table actions.
          // onFilter/onSort/onRefresh are replaced by actions/global handlers below.
          onRowClick={(row: Ticket) => {
            const id = row.id;
            const encodedTicketId = encodeTicketId(String(id));
            window.location.href = `/tickets/${encodedTicketId}`;
          }}
          actions={{
            global: [
              {
                key: "refresh",
                label: "Refresh",
                icon: <RefreshIcon />,
                onClick: refresh,
              },
            ],
            row: [
              {
                key: "open",
                label: "Open",
                icon: null,
                onClick: (row: Ticket) => {
                  const id = row.id;
                  const encodedTicketId = encodeTicketId(String(id));
                  window.location.href = `/tickets/${encodedTicketId}`;
                },
              },
            ],
          }}
          pagination={{
            page,
            pageSize,
            total: tickets.length,
            onPageChange: (nextPage: number) => setPage(nextPage),
            onPageSizeChange: (nextSize: number) => setPageSize(nextSize),
          }}
        />
      </div>
    </>
  );
}
