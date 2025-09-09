import React, {useMemo} from "react";
import "./TicketSummary.css";

interface Ticket {
    id: string;
    subject: string;
    status: string;
    source: string;
    date: string;
}

interface TicketSummaryProps {
    tickets: Ticket[];
    onSelectStatus: (status: string) => void;
}

const TicketSummary: React.FC<TicketSummaryProps> = ({tickets, onSelectStatus}) => {
    const summary = useMemo(() => {
        return {
            all: tickets.length,
            open: tickets.filter(t => t.status.toLowerCase() === 'open').length,
            inProgress: tickets.filter(t => t.status.toLowerCase() === 'in progress').length,
            resolved: tickets.filter(t => t.status.toLowerCase() === 'resolved').length,
            closed: tickets.filter(t => t.status.toLowerCase() === 'closed').length,
            dropped: tickets.filter(t => t.status.toLowerCase() === 'dropped').length,
            onHold: tickets.filter(t => t.status.toLowerCase() === 'on hold').length,
        };
    }, [tickets]);

    const [selectedStatus, setSelectedStatus] = React.useState('all');

    const handleSelect = (status: string) => {
        setSelectedStatus(status);
        onSelectStatus(status);
    };

    return (
        <div className="ticket-summary">
            <div className="summary-list">
                <ul>
                    <li className={`summary-item all ${selectedStatus === 'all' ? 'active' : ''}`}
                        onClick={() => handleSelect('all')}>
                        <span className="squareContainer"></span>
                        <span className="leadText">All</span>
                        <span>{summary.all}</span>
                    </li>
                    <li className={`summary-item open ${selectedStatus === 'open' ? 'active' : ''}`}
                        onClick={() => handleSelect('open')}>
            <span
                className="squareContainer"
                style={{backgroundColor: "#fd7e13"}}
            ></span>
                        <span className="leadText">Open</span>
                        <span>{summary.open}</span>
                    </li>
                    <li className={`summary-item in-progress ${selectedStatus === 'in progress' ? 'active' : ''}`}
                        onClick={() => handleSelect('in progress')}>
            <span
                className="squareContainer"
                style={{backgroundColor: "#1c7ed6"}}
            ></span>
                        <span className="leadText">In Progress</span>
                        <span>{summary.inProgress}</span>
                    </li>
                    <li className={`summary-item resolved ${selectedStatus === 'resolved' ? 'active' : ''}`}
                        onClick={() => handleSelect('resolved')}>
            <span
                className="squareContainer"
                style={{backgroundColor: "#36b14d"}}
            ></span>
                        <span className="leadText">Resolved</span>
                        <span>{summary.resolved}</span>
                    </li>
                    <li className={`summary-item closed ${selectedStatus === 'closed' ? 'active' : ''}`}
                        onClick={() => handleSelect('closed')}>
            <span
                className="squareContainer"
                style={{backgroundColor: "#0ca577"}}
            ></span>
                        <span className="leadText">Closed</span>
                        <span>{summary.closed}</span>
                    </li>
                    <li className={`summary-item dropped ${selectedStatus === 'dropped' ? 'active' : ''}`}
                        onClick={() => handleSelect('dropped')}>
            <span
                className="squareContainer"
                style={{backgroundColor: "#ef3d3d"}}
            ></span>
                        <span className="leadText">Dropped</span>
                        <span>{summary.dropped}</span>
                    </li>
                    <li className={`summary-item on-hold ${selectedStatus === 'on hold' ? 'active' : ''}`}
                        onClick={() => handleSelect('on hold')}>
            <span
                className="squareContainer"
                style={{backgroundColor: "#5b5e66"}}
            ></span>
                        <span className="leadText">On Hold</span>
                        <span>{summary.onHold}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default TicketSummary;
