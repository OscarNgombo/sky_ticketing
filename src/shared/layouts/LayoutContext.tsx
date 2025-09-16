import React, { useState } from "react";
import { LayoutContext } from "./LayoutContext.1";

const defaultLayout: LayoutConfig = {
  leftText: "Sky Ticketing",
  leftButtonText: "Vendor",
  rightItems: [],
  mainContentClassName: undefined,
};

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState<LayoutConfig>(defaultLayout);
  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </LayoutContext.Provider>
  );
}

export type LayoutConfig = {
  leftText: string;
  leftButtonText: string;
  rightItems: React.ReactNode[];
  mainContentClassName?: string;
};
