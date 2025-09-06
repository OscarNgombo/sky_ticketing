import { useNavigate } from "react-router-dom";
import Button from "../components/buttons/Button";
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
import TicketItem from "../components/tickets/TicketItem";
import TicketSummary from "../components/tickets/TicketSummary";

const tickets = [
  {
    id: "1",
    subject: "My computer is not turning on",
    status: "Open",
    date: "2025-09-06",
  },
  {
    id: "2",
    subject: "I forgot my password",
    status: "In Progress",
    date: "2025-09-05",
  },
  {
    id: "3",
    subject: "The printer is not working",
    status: "Closed",
    date: "2025-09-04",
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
      <div
        style={{
          backgroundColor: "#E3E3E3",
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>All Tickets</h2>
        <Button onClick={handleCreateTicket} variant="primary">
          Add Ticket
        </Button>
      </div>
      <div style={{ display: "flex" }}>
        <TicketSummary />
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <TicketItem key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default TicketsPage;
