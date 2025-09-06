import React from 'react';
import './TicketSummary.css';

const ticketSummaryData = {
  all: 10,
  open: 3,
  inProgress: 2,
  resolved: 4,
  closed: 1,
  dropped: 0,
  onHold: 0,
};

const TicketSummary: React.FC = () => {
  return (
    <div className="ticket-summary">
      <div className="summary-header">
        <h3>Ticket Summary</h3>
      </div>
      <div className="summary-list">
        <ul>
          <li>
            <span>All</span>
            <span>{ticketSummaryData.all}</span>
          </li>
          <li>
            <span>Open</span>
            <span>{ticketSummaryData.open}</span>
          </li>
          <li>
            <span>In Progress</span>
            <span>{ticketSummaryData.inProgress}</span>
          </li>
          <li>
            <span>Resolved</span>
            <span>{ticketSummaryData.resolved}</span>
          </li>
          <li>
            <span>Closed</span>
            <span>{ticketSummaryData.closed}</span>
          </li>
          <li>
            <span>Dropped</span>
            <span>{ticketSummaryData.dropped}</span>
          </li>
          <li>
            <span>On Hold</span>
            <span>{ticketSummaryData.onHold}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TicketSummary;
