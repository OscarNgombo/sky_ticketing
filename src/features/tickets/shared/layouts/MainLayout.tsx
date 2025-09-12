import React, { useState } from "react";
import "../../styles/MainLayout.css";
import Header from "../navs/headers/Header";
import Footer from "../footer/footer";
import SideNav from "../navs/side/sideNav";

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
