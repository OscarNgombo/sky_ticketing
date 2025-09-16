import React from "react";
import "./Button.css";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  disabled?: boolean;
}

function Button({
  children,
  onClick,
  variant,
  className,
  disabled,
}: ButtonProps) {
  const buttonClass = ["btn", variant ? `btn-${variant}` : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={buttonClass} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;
