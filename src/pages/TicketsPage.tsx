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
import TicketItem from "../components/tickets/TicketItem";
import TicketSummary from "../components/tickets/TicketSummary";
import { useNavigate } from "react-router-dom";

const tickets = [
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
        <div className="ticketList">
          <div className="ticketColumns">
            <span>Ticket ID</span>
            <span>Ticket Subject</span>
            <span>Ticket Status</span>
            <span>Source</span>
            <span>Date Created</span>
          </div>
          {tickets.map((ticket) => (
            <TicketItem key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default TicketsPage;
