import React, { useState } from "react";
import "../../features/tickets/styles/MainLayout.css";
import Header from "../components/navs/headers/Header.tsx";
import Footer from "../components/footer/footer.tsx";
import SideNav from "../components/navs/side/sideNav.tsx";

interface MainLayoutProps {
  children: React.ReactNode;
  leftText: string;
  leftButtonText: string;
  userType: string;
  username: string;
  rightItems: React.ReactNode[];
  mainContentClassName?: string;
}

function MainLayout({
  children,
  leftText,
  leftButtonText,
  userType,
  username,
  rightItems,
  mainContentClassName,
}: MainLayoutProps) {
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(false);

  const toggleSideNav = () => {
    setIsSideNavCollapsed(!isSideNavCollapsed);
  };

  const layoutClasses = [
    "main-layout",
    isSideNavCollapsed ? "sidenav-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={layoutClasses}>
      <Header
        isSideNavCollapsed={isSideNavCollapsed}
        leftText={leftText}
        leftButtonText={leftButtonText}
        userType={userType}
        username={username}
        rightItems={rightItems}
      />
      <SideNav
        isCollapsed={isSideNavCollapsed}
        onToggleCollapse={toggleSideNav}
      />
      <main className={mainContentClassName}>{children}</main>
      <Footer username={username} company={leftText} userType={userType} />
    </div>
  );
}

export default MainLayout;
