
import { useState } from "react";
import Footer from "../footer/footer";
import Header from "../headers/Header";
import SideNav from "../navs/side/sideNav";
import "./MainLayout.css";

interface MainLayoutProps {
  children: React.ReactNode;
  leftText: string;
  leftButtonText: string;
  userType: string;
  rightItems: React.ReactNode[];
}

function MainLayout({
  children,
  leftText,
  leftButtonText,
  userType,
  rightItems,
}: MainLayoutProps) {
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(false);

  const toggleSideNav = () => {
    setIsSideNavCollapsed(!isSideNavCollapsed);
  };

  return (
    <div
      className={`main-layout ${
        isSideNavCollapsed ? "sidenav-collapsed" : ""
      }`}
    >
      <Header
        isSideNavCollapsed={isSideNavCollapsed}
        leftText={leftText}
        leftButtonText={leftButtonText}
        userType={userType}
        rightItems={rightItems}
      />
      <SideNav
        isCollapsed={isSideNavCollapsed}
        onToggleCollapse={toggleSideNav}
      />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}

export default MainLayout;
