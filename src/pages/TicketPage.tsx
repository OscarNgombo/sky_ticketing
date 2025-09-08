import MainLayout from "../layouts/MainLayout.tsx";
import "./TicketPage.css";
import {AddIcon, SearchIcon, NotificationIcon, UserIcon} from "../icons/icons.tsx";
import CreateTicketForm from "../components/forms/CreateTicketForm.tsx";

interface TicketPageProps {
    handleCreateTicket?: () => void
}

function TicketPage({handleCreateTicket}: TicketPageProps) {
    const rightNavItems = [
        <AddIcon/>,
        <SearchIcon/>,
        <NotificationIcon/>,
        <UserIcon/>,
    ];

    return (
        <MainLayout
            leftText="Help Desk - Njiwa SACCO"
            leftButtonText="CLIENT"
            userType="Client"
            rightItems={rightNavItems}
            mainContentClassName="ticket-page"
        >
            <div className="ticketPageMain">
                <header>
                    <p>Create Ticket</p>
                </header>
                <section>
                    <CreateTicketForm onSubmit={handleCreateTicket} onCancel={handleCreateTicket} />
                </section>
            </div>
        </MainLayout>
    );
}

export default TicketPage;
