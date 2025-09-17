
import TicketListContext from "./TicketListContext";
import type { TicketListContextValue } from "./TicketListContext";
import { useContext } from "react";

export function useTicketList() {
  const ctx = useContext(TicketListContext) as TicketListContextValue | null;
  if (!ctx) throw new Error("useTicketList must be used within a TicketListComposer");
  return ctx;
}
