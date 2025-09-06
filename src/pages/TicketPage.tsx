import MainLayout from "../components/layouts/MainLayout";
import { AddIcon, SearchIcon, NotificationIcon, UserIcon } from "../components/icons";

function TicketPage() {
  const rightNavItems = [
    <AddIcon />,
    <SearchIcon />,
    <NotificationIcon />,
    <UserIcon />,
  ];

  return (
    <MainLayout
      leftText="Help Desk - Njiwa SACCO"
      leftButtonText="CLIENT"
      userType="Client"
      rightItems={rightNavItems}
    >
      <div></div>
    </MainLayout>
  );
}

export default TicketPage;
