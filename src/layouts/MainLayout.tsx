import React, { useState } from "react";
import Footer from "../components/footer/footer";
import SideNav from "../components/navs/side/sideNav";
import "./MainLayout.css";
import Header from "../components/navs/headers/Header";

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
