import React from "react";
import "./TicketSummary.css";

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
      <div className="summary-list">
        <ul>
          <li>
            <span className="squareContainer"></span>
            <span className="leadText">All</span>
            <span>{ticketSummaryData.all}</span>
          </li>
          <li>
            <span
              className="squareContainer"
              style={{ backgroundColor: "#fd7e13" }}
            ></span>
            <span className="leadText">Open</span>
            <span>{ticketSummaryData.open}</span>
          </li>
          <li>
            <span
              className="squareContainer"
              style={{ backgroundColor: "#1c7ed6" }}
            ></span>
            <span className="leadText">In Progress</span>
            <span>{ticketSummaryData.inProgress}</span>
          </li>
          <li>
            <span
              className="squareContainer"
              style={{ backgroundColor: "#36b14d" }}
            ></span>
            <span className="leadText">Resolved</span>
            <span>{ticketSummaryData.resolved}</span>
          </li>
          <li>
            <span
              className="squareContainer"
              style={{ backgroundColor: "#0ca577" }}
            ></span>
            <span className="leadText">Closed</span>
            <span>{ticketSummaryData.closed}</span>
          </li>
          <li>
            <span
              className="squareContainer"
              style={{ backgroundColor: "#ef3d3d" }}
            ></span>
            <span className="leadText">Dropped</span>
            <span>{ticketSummaryData.dropped}</span>
          </li>
          <li>
            <span
              className="squareContainer"
              style={{ backgroundColor: "#5b5e66" }}
            ></span>
            <span className="leadText">On Hold</span>
            <span>{ticketSummaryData.onHold}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TicketSummary;
