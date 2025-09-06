import React from "react";
import "./Button.css";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}

function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const buttonClass = `btn btn-${variant} ${className}`;
  return <button className={buttonClass} onClick={onClick}>{children}</button>;
}

export default Button;