import React, { createContext } from "react";
import type { LayoutConfig } from "./LayoutContext";

export const LayoutContext = createContext<{
    layout: LayoutConfig;
    setLayout: React.Dispatch<React.SetStateAction<LayoutConfig>>;
} | null>(null);
