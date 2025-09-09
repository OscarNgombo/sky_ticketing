import React, { useState } from "react";
import "./sideNav.css";
import {
  DashboardIcon,
  TicketsIcon,
  ReportsIcon,
  CalenderIcon,
  UsersIcon,
  SettingsIcon,
  SideMenuIcon,
} from "../../../icons/icons";
import Modal from "../../modal/Modal";
import { useNavigate } from "react-router-dom";

interface SideNavProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SideNav: React.FC<SideNavProps> = ({ isCollapsed, onToggleCollapse }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleComingSoonClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const navigate = useNavigate();
  const handleNavigation = () => {
    navigate("/tickets");
  };
  const navItems = [
    {
      icon: <DashboardIcon />,
      text: "Dashboard",
      handler: handleComingSoonClick,
    },
    { icon: <TicketsIcon />, text: "Tickets", handler: handleNavigation },
    { icon: <ReportsIcon />, text: "Reports", handler: handleComingSoonClick },
    {
      icon: <CalenderIcon />,
      text: "Calendar",
      handler: handleComingSoonClick,
    },
    { icon: <UsersIcon />, text: "Tasks", handler: handleComingSoonClick },
    {
      icon: <SettingsIcon />,
      text: "Settings",
      handler: handleComingSoonClick,
    },
  ];

  return (
    <>
      <aside className={`side-nav ${isCollapsed ? "collapsed" : ""}`}>
        <div className="top-actions">
          {navItems.map((item, index) => (
            <div
              key={index}
              className="side-nav-actions"
              onClick={item.handler}
            >
              {item.icon}
              <p>{item.text}</p>
            </div>
          ))}
        </div>
        <div className="bottom-actions" onClick={onToggleCollapse}>
          <div className="side-nav-actions">
            <SideMenuIcon />
            <p>Collapse</p>
          </div>
        </div>
      </aside>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Coming Soon!"
      >
        <p>This feature is under development and will be available shortly.</p>
      </Modal>
    </>
  );
};

export default SideNav;
