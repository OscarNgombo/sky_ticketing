import CreateTicketForm from "../../../shared/components/forms/CreateTicketForm";
import MainLayout from "../shared/layouts/MainLayout";
import {
  AddIcon,
  SearchIcon,
  NotificationIcon,
  UserIcon,
} from "../../../shared/icons/icons";
import "../styles/TicketPage.css";

interface TicketPageProps {
  handleCreateTicket?: () => void;
  user?: {
    username: string;
    userType: string;
    company: string;
  };
}

function TicketPage({ handleCreateTicket, user }: TicketPageProps) {
  const rightNavItems = [
    <AddIcon />,
    <SearchIcon />,
    <NotificationIcon />,
    <UserIcon />,
  ];

  return (
    <MainLayout
      leftText={user?.company || "Help Desk"}
      leftButtonText={user?.userType || "CLIENT"}
      userType={user?.userType || "Client"}
      username={user?.username || "Guest"}
      rightItems={rightNavItems}
      mainContentClassName="ticket-page"
    >
      <div className="ticketPageMain">
        <header>
          <p>Create Ticket</p>
        </header>
        <section className="create-ticket-section">
          <CreateTicketForm onCancel={handleCreateTicket} user={user} />
        </section>
      </div>
    </MainLayout>
  );
}

export default TicketPage;
