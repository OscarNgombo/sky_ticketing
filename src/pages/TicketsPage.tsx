import Dropdown from "../components/inputs/Dropdown";
import React, { useState } from "react";
import MainLayout from "../components/layouts/MainLayout";
import {
  AddIcon,
  SearchIcon,
  NotificationIcon,
  UserIcon,
} from "../components/icons";
import "./TicketsPage.css";
import Button from "../components/buttons/Button";
import TicketSummary from "../components/tickets/TicketSummary";
import { useNavigate } from "react-router-dom";
import Table, { type Column } from "../components/table/Table";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  source: string;
  date: string;
}

const tickets: Ticket[] = [
  {
    id: "1",
    subject: "My computer is not turning on",
    status: "Open",
    source: "Email",
    date: "2025-09-06 12:00:00",
  },
  {
    id: "2",
    subject: "I forgot my password",
    status: "In Progress",
    source: "Email",
    date: "2025-09-05 12:00:00",
  },
  {
    id: "3",
    subject: "The printer is not working",
    source: "Email",
    status: "Closed",
    date: "2025-09-04 12:00:00",
  },
  {
    id: "4",
    subject: "The printer is not working",
    source: "Help Desk System",
    status: "Closed",
    date: "2025-09-04 12:00:00",
  },
];

function TicketsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");

  const handleCreateTicket = () => {
    navigate("/ticket/new");
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
    console.log("Selected filter:", e.target.value);
  };

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
    <AddIcon />,
    <SearchIcon />,
    <Dropdown
      options={ticketStatusOptions}
      value={filter}
      onChange={handleFilterChange}
      placeholder="Apstar SACCO Limited"
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
      <TicketSummary />
      <div className="ticket-list-container">
        <Table columns={ticketColumns} data={tickets} />
      </div>
    </MainLayout>
  );
}

export default TicketsPage;
