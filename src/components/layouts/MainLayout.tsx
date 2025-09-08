import React, { useState } from "react";
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
  mainContentClassName?: string;
}

function MainLayout({
  children,
  leftText,
  leftButtonText,
  userType,
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
        rightItems={rightItems}
      />
      <SideNav
        isCollapsed={isSideNavCollapsed}
        onToggleCollapse={toggleSideNav}
      />
      <main className={mainContentClassName}>{children}</main>
      <Footer />
    </div>
  );
}

export default MainLayout;
