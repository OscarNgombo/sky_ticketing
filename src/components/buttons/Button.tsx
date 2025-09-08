import React from "react";
import "./Button.css";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}

function Button({ children, onClick, variant, className }: ButtonProps) {
  let buttonClass;
  if (
    variant?.localeCompare("primary") ||
    variant?.localeCompare("secondary")
  ) {
    buttonClass = `btn btn-${variant} ${className}`;
  } else {
    buttonClass = className;
  }
  return (
    <button className={buttonClass} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
