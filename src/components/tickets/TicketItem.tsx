import React from 'react';
import './TicketItem.css';

interface TicketItemProps {
  ticket: {
    id: string;
    subject: string;
    status: string;
    date: string;
  };
}

const TicketItem: React.FC<TicketItemProps> = ({ ticket }) => {
  return (
    <div className="ticket-item">
      <div className="ticket-info">
        <input type="checkbox" />
        <span>{ticket.subject}</span>
      </div>
      <div className="ticket-details">
        <span>{ticket.status}</span>
        <span>{ticket.date}</span>
      </div>
    </div>
  );
};

export default TicketItem;
