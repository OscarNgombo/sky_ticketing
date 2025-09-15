import React from "react";
import "./Button.css";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}

function Button({ children, onClick, variant, className }: ButtonProps) {
  const buttonClass = [
    "btn",
    variant ? `btn-${variant}` : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={buttonClass} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
