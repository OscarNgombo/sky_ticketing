import React from "react";

export interface Ticket {
  id: string;
  subject: string;
  status: string;
  source: string;
  date: string;
}

export interface StoredTicket {
  id: number;
  mainCategory: string;
  subCategory: string;
  problem: string;
  description: string;
  source: string;
  files: File[];
  company: string;
  status: string;
  createdAt: string;
}

export type TableFilter = {
  field: keyof Ticket;
  operator: "contains" | "is" | "is_not" | "starts_with" | "ends_with";
  value: string;
};

export type TableSort = { field: keyof Ticket; direction: "asc" | "desc" };

export interface TicketListContextValue {
  tickets: Ticket[];
  processedTickets: Ticket[];
  filters: TableFilter[];
  setFilters: (f: TableFilter[]) => void;
  sorts: TableSort[];
  setSorts: (s: TableSort[]) => void;
  refresh: () => Promise<void>;
  loading: boolean;
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
  total: number;
  summaryFilter: string;
  setSummaryFilter: (s: string) => void;
}

const TicketListContext = React.createContext<TicketListContextValue | null>(
  null
);

export default TicketListContext;
