import Dropdown from "../components/inputs/Dropdown";
import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../layouts/MainLayout.tsx";
import {
  AddIcon,
  SearchIcon,
  NotificationIcon,
  UserIcon,
} from "../icons/icons.tsx";
import "./TicketsPage.css";
import Button from "../components/buttons/Button";
import TicketSummary from "../components/TicketSummary.tsx";
import { useNavigate } from "react-router-dom";
import Modal from "../components/modal/Modal.tsx";
import Table, { type Column } from "../components/table/Table";

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
  files: File[];
  createdAt: string;
}

function TicketsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summaryFilter, setSummaryFilter] = useState('all');

  const handleCreateTicket = () => {
    navigate("/ticket/new");
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
    console.log("Selected filter:", e.target.value);
  };

  const handleSummaryFilterChange = (status: string) => {
    setSummaryFilter(status);
  };

  useEffect(() => {
    const storedTicketsData = localStorage.getItem('tickets');
    if (storedTicketsData) {
      const parsedTickets: StoredTicket[] = JSON.parse(storedTicketsData);

      const displayTickets = parsedTickets.map(ticket => ({
        id: ticket.id.toString(),
        subject: ticket.problem,
        status: 'Open',
        source: 'Sky Support Portal',
        date: new Date(ticket.createdAt).toLocaleString(),
      }));

      // Sort by most recent first
      setTickets(displayTickets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, []);

  const filteredTickets = useMemo(() => {
    if (summaryFilter === 'all') {
      return tickets;
    }
    return tickets.filter(
      (ticket) => ticket.status.toLowerCase() === summaryFilter
    );
  }, [tickets, summaryFilter]);

  const ticketStatusOptions = [
    "Apstar SACCO",
    "Mwalimu SACCO",
    "Defence SACCO",
    "Wetu SACCO",
  ];

  const ticketColumns: Column<Ticket>[] = [
    { header: "Ticket ID", accessor: "id" },
    {
      header: "Ticket Subject",
      accessor: "subject",
      cell: (value) => <span className="ticket-subject-cell">{value}</span>,
    },
    { header: "Ticket Status", accessor: "status" },
    { header: "Source", accessor: "source" },
    { header: "Date Created", accessor: "date" },
  ];

  const rightNavItems = [
    <div onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }} title="Coming Soon">
      <AddIcon />
    </div>,
    <SearchIcon />,
    <Dropdown
      options={ticketStatusOptions}
      value={filter}
      onChange={handleFilterChange}
      placeholder="Apstar SACCO Limited"
      showIcon={false}
    />,
    <NotificationIcon />,
    <UserIcon />,
  ];

  return (
    <MainLayout
      leftText="Help Desk - Sky World Limited"
      leftButtonText="VENDOR"
      userType="Vendor"
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
      <TicketSummary tickets={tickets} onSelectStatus={handleSummaryFilterChange} />
      <div className="ticket-list-container">
        <Table columns={ticketColumns} data={filteredTickets} />
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Feature Update">
        <p>This feature is coming soon. Stay tuned!</p>
      </Modal>
    </MainLayout>
  );
}

export default TicketsPage;
