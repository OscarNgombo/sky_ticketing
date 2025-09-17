import React, { useCallback, useEffect, useMemo, useState } from "react";
import CryptoJS from "crypto-js";
import { TableControllerProvider } from "../components/table/TableControllerProvider";
import TicketListContext, {
  type TicketListContextValue,
  type TableFilter,
  type TableSort,
  type Ticket,
  type StoredTicket,
} from "./TicketListContext";
import type { Column } from "../components/Table";

interface TicketListComposerProps {
  children: React.ReactNode;
  columns: Column<Ticket>[];
  initialFilters?: TableFilter[];
  initialSorts?: TableSort[];
}

export default function TicketListComposer({
  children,
  columns,
  initialFilters,
  initialSorts,
}: TicketListComposerProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<TableFilter[]>(initialFilters ?? []);
  const [sorts, setSorts] = useState<TableSort[]>(initialSorts ?? []);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [summaryFilter, setSummaryFilter] = useState<string>("all");

  const loadStoredTickets = useCallback(() => {
    setLoading(true);
    try {
      const TICKET_SECRET = "skyworld_ticket_secret_2025";
      const storedTicketsData = localStorage.getItem("tickets");
      let parsedTickets: StoredTicket[] = [];
      if (storedTicketsData) {
        try {
          const decrypted = CryptoJS.AES.decrypt(
            storedTicketsData,
            TICKET_SECRET
          ).toString(CryptoJS.enc.Utf8);
          if (decrypted) parsedTickets = JSON.parse(decrypted);
        } catch {
          try {
            parsedTickets = JSON.parse(storedTicketsData);
          } catch {
            parsedTickets = [];
          }
        }
      }

      const displayTickets = parsedTickets.map((ticket) => ({
        id: String(ticket.id),
        subject: ticket.problem,
        status: ticket.status || "Open",
        source: ticket.source,
        date: new Date(ticket.createdAt).toLocaleString(),
      }));

      const sorted = displayTickets.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTickets(sorted);
      setTotal(sorted.length);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get("filters");
    const s = params.get("sorts");
    const p = parseInt(params.get("page") ?? "1", 10) || 1;
    const ps = parseInt(params.get("pageSize") ?? "25", 10) || 25;
    if (f) {
      try {
        const parsed = JSON.parse(decodeURIComponent(f));
        setFilters(parsed as TableFilter[]);
      } catch {
        /* ignore */
      }
    }
    if (s) {
      try {
        const parsed = JSON.parse(decodeURIComponent(s));
        setSorts(parsed as TableSort[]);
      } catch {
        /* ignore */
      }
    }
    setPage(p);
    setPageSize(ps);
  }, []);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (filters && filters.length)
      qs.set("filters", encodeURIComponent(JSON.stringify(filters)));
    if (sorts && sorts.length)
      qs.set("sorts", encodeURIComponent(JSON.stringify(sorts)));
    if (page && page > 1) qs.set("page", String(page));
    if (pageSize && pageSize !== 25) qs.set("pageSize", String(pageSize));
    const base = window.location.pathname;
    window.history.replaceState(
      {},
      "",
      base + (qs.toString() ? `?${qs.toString()}` : "")
    );
  }, [filters, sorts, page, pageSize]);

  useEffect(() => {
    loadStoredTickets();
  }, [loadStoredTickets]);

  const processedTickets = useMemo(() => {
    let filtered = tickets;
    if (summaryFilter !== "all")
      filtered = filtered.filter(
        (t) => t.status.toLowerCase() === summaryFilter
      );

    if (filters.length > 0) {
      filtered = filtered.filter((ticket) => {
        return filters.every((filter) => {
          const ticketValue = String(
            ticket[filter.field as keyof Ticket] ?? ""
          );
          switch (filter.operator) {
            case "contains":
              return ticketValue
                .toLowerCase()
                .includes(filter.value.toLowerCase());
            case "is":
              return ticketValue.toLowerCase() === filter.value.toLowerCase();
            case "is_not":
              return ticketValue.toLowerCase() !== filter.value.toLowerCase();
            case "starts_with":
              return ticketValue
                .toLowerCase()
                .startsWith(filter.value.toLowerCase());
            case "ends_with":
              return ticketValue
                .toLowerCase()
                .endsWith(filter.value.toLowerCase());
            default:
              return true;
          }
        });
      });
    }

    if (sorts.length > 0) {
      filtered.sort((a, b) => {
        for (const sort of sorts) {
          const aValue = a[sort.field as keyof Ticket];
          const bValue = b[sort.field as keyof Ticket];
          if (aValue < bValue) return sort.direction === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [tickets, summaryFilter, filters, sorts, page, pageSize]);

  const refresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 150));
    loadStoredTickets();
  }, [loadStoredTickets]);

  const value: TicketListContextValue = {
    tickets,
    processedTickets,
    filters,
    setFilters,
    sorts,
    setSorts,
    refresh,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    summaryFilter,
    setSummaryFilter,
  };

  return (
    <TicketListContext.Provider value={value}>
      <TableControllerProvider
        columns={columns}
        initialFilters={filters}
        initialSorts={sorts}
        onRefresh={refresh}
      >
        {children}
      </TableControllerProvider>
    </TicketListContext.Provider>
  );
}
