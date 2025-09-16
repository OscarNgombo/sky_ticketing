import CreateTicketForm from "../../../shared/components/forms/CreateTicketForm";
import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  AddIcon,
  SearchIcon,
  NotificationIcon,
  UserIcon,
} from "../../../shared/icons/icons";
import Dropdown from "../components/Dropdown";
import "../styles/TicketPage.css";
import { useSetLayout } from "../../../shared/layouts/useSetLayout";
import { getCurrentUser } from "../../../utils/auth";
import { useNavigate } from "@tanstack/react-router";

interface TicketPageProps {
  handleCreateTicket?: () => void;
  user?: {
    username: string;
    userType: string;
    company: string;
  };
}

function TicketPage({ handleCreateTicket, user }: TicketPageProps) {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const currentUser = user ?? getCurrentUser() ?? undefined;
  const isVendor = (currentUser?.userType || "").toLowerCase() === "vendor";
  const [filter, setFilter] = useState("");

  const rightNavItems = useMemo(() => {
    const items: React.ReactNode[] = [
      <div
        key="add"
        onClick={() => navigateRef.current({ to: "/createTicket" })}
        style={{ cursor: "pointer" }}
      >
        <AddIcon />
      </div>,
      <div key="search" title="Coming Soon" style={{ cursor: "pointer" }}>
        <SearchIcon />
      </div>,
    ];
    if (isVendor) {
      items.push(
        <Dropdown
          key="sacco-filter"
          options={[
            "Apstar SACCO",
            "Mwalimu SACCO",
            "Defence SACCO",
            "Wetu SACCO",
          ]}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Apstar SACCO Limited"
          showIcon={false}
        />
      );
    }
    items.push(
      <div key="notifications" title="Coming Soon" style={{ cursor: "pointer" }}>
        <NotificationIcon />
      </div>,
      <div key="user" title="Coming Soon" style={{ cursor: "pointer" }}>
        <UserIcon />
      </div>
    );
    return items;
  }, [filter, isVendor]);

  useSetLayout({
    leftText: currentUser?.company || "Help Desk",
    leftButtonText: currentUser?.userType || "CLIENT",
    rightItems: rightNavItems,
    mainContentClassName: "ticket-page",
  });

  return (
    <div className="ticketPageMain">
      <header>
        <p>Create Ticket</p>
      </header>
      <section className="create-ticket-section">
        <CreateTicketForm onCancel={handleCreateTicket} user={currentUser} />
      </section>
    </div>
  );
}

export default TicketPage;
