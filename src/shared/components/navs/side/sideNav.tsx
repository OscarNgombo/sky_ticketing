import React from "react";
import "../../../../features/tickets/styles/sideNav.css";
import {useNavigate} from "@tanstack/react-router";
import {
    DashboardIcon,
    TicketsIcon,
    ReportsIcon,
    CalenderIcon,
    UsersIcon,
    SettingsIcon,
    SideMenuIcon, LogoutIcon,
} from "../../../icons/icons.tsx";
import { logout } from "../../../../utils/auth";

interface SideNavProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const SideNav: React.FC<SideNavProps> = ({isCollapsed, onToggleCollapse}) => {
    const navigate = useNavigate();

    const handleNavigation = (page: string) => {
        return () => {
            switch (page.toLowerCase()) {
                case "tickets":
                    navigate({to: "/tickets"});
                    break;
                case "dashboard":
                    navigate({to: "/dashboard"});
                    break;
                case "tasks":
                    navigate({to: "/tasks"});
                    break;
                case "logout":
                    logout();
                    navigate({ to: "/login", search: {} as any });
                    break;
                default:
                    break;
            }
        };
    };
    const navItems = [
        {
            icon: <DashboardIcon/>,
            text: "Dashboard",
            handler: handleNavigation("Dashboard"),
        },
        {
            icon: <TicketsIcon/>,
            text: "Tickets",
            handler: handleNavigation("Tickets"),
        },
        {icon: <ReportsIcon/>, text: "Reports", handler: handleNavigation("Reports")},
        {
            icon: <CalenderIcon/>,
            text: "Calendar",
            handler: handleNavigation("Calendar"),
        },
        {icon: <UsersIcon/>, text: "Tasks", handler: handleNavigation("Tasks")},
        {
            icon: <SettingsIcon/>,
            text: "Settings",
            handler: handleNavigation("Settings"),
        }, {icon: <LogoutIcon/>, text: "Logout", handler: handleNavigation("logout")}
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
                        <SideMenuIcon/>
                        <p>Collapse</p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default SideNav;
