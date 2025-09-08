import React from "react";
import "./TicketItem.css";

interface TicketItemProps {
  ticket: {
    id: string;
    subject: string;
    status: string;
    source: string;
    date: string;
  };
}

const TicketItem: React.FC<TicketItemProps> = ({ ticket }) => {
  return (
    <div className="ticket-item">
      <span>{ticket.id}</span>
      <span>{ticket.subject}</span>
      <span>{ticket.status}</span>
      <span>{ticket.source}</span>
      <span>{ticket.date}</span>
    </div>
  );
};

export default TicketItem;
