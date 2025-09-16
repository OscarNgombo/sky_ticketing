import React from "react";
import type { LayoutConfig } from "./LayoutContext";
import { useLayout } from "./useLayout";

export function useSetLayout(config: LayoutConfig) {
  const { setLayout } = useLayout();
  React.useEffect(() => {
    setLayout((prev) => {
      const same =
        prev.leftText === config.leftText &&
        prev.leftButtonText === config.leftButtonText &&
        prev.mainContentClassName === config.mainContentClassName &&
        prev.rightItems === config.rightItems;
      return same ? prev : config;
    });
  }, [config, setLayout]);
}
