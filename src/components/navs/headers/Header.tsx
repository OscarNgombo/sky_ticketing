import React from "react";
import "./Header.css";
import Button from "../../buttons/Button";
import { Logo } from "../../../icons/icons";

interface HeaderProps {
  leftText: string;
  leftButtonText: string;
  userType: string;
  rightItems?: React.ReactNode[];
  isSideNavCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  leftText,
  leftButtonText,
  rightItems = [],
  isSideNavCollapsed = false,
  userType,
}) => {
  return (
    <header className="header">
      <div className="header-left">
        <div className={`logo ${isSideNavCollapsed ? "collapsed" : ""}`}>
          <Logo />
        </div>
        <span className="header-text">{leftText}</span>
        <Button className={userType.toLowerCase()}>
          <p>{leftButtonText}</p>
        </Button>
      </div>
      <div className="header-right">
        {rightItems.map((item, index) => (
          <React.Fragment key={index}>{item}</React.Fragment>
        ))}
      </div>
    </header>
  );
};

export default Header;
