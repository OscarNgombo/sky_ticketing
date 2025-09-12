import { useEffect, useState, useCallback } from "react";
import MainLayout from "../../tickets/shared/layouts/MainLayout";
import Table from "../../tickets/components/Table";
import type { Column } from "../../tickets/components/Table";
import { fetchPeople } from "../api";
import type { ODataFilter } from "../api";
import { useNavigate } from "@tanstack/react-router";
import "../styles/TasksPage.css";

interface Person {
  id: string;
  UserName: string;
  FirstName?: string;
  LastName?: string;
  MiddleName?: string;
  Gender?: string;
  Age?: number | string;
  countryRegion?: string;
  city?: string;
  availability?: string;
  ticketAssignedCount?: number;
}

const PAGE_SIZE = 10;

const columns: Column<Person>[] = [
  { header: "User Name", accessor: "UserName" as keyof Person },
  { header: "First Name", accessor: "FirstName" as keyof Person },
  { header: "Last Name", accessor: "LastName" as keyof Person },
  { header: "Country / Region", accessor: "countryRegion" as keyof Person },
  { header: "City", accessor: "city" as keyof Person },
  { header: "Availability", accessor: "availability" as keyof Person },
  {
    header: "Tickets Assigned",
    accessor: "ticketAssignedCount" as keyof Person,
  },
];

function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const page = parseInt(params.get("page") ?? "1", 10) || 1;
  const pageSize =
    parseInt(params.get("pageSize") ?? String(PAGE_SIZE), 10) || PAGE_SIZE;
  const filters = params.get("filters");
  const sorts = params.get("sorts");
  let parsedFilters: ODataFilter[] = [];
  let parsedSorts: { field: string; direction: "asc" | "desc" }[] = [];
  if (filters) {
    try {
      parsedFilters = JSON.parse(decodeURIComponent(filters));
    } catch (err) {
      console.warn("Failed parsing filters from URL", err);
    }
  }
  if (sorts) {
    try {
      parsedSorts = JSON.parse(decodeURIComponent(sorts));
    } catch (err) {
      console.warn("Failed parsing sorts from URL", err);
    }
  }

  return { page, pageSize, filters: parsedFilters, sorts: parsedSorts };
}

export default function TasksPage() {
  const navigate = useNavigate();
  const parsed = parseUrlParams();

  const [data, setData] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(parsed.page);
  const [currentPageSize] = useState<number>(parsed.pageSize);
  const [serverFilters, setServerFilters] = useState<ODataFilter[]>(
    parsed.filters ?? []
  );
  const [serverSorts, setServerSorts] = useState<
    { field: string; direction: "asc" | "desc" }[]
  >(parsed.sorts ?? []);

  const syncUrl = useCallback(() => {
    const qs = new URLSearchParams();
    if (currentPage && currentPage > 1) qs.set("page", String(currentPage));
    if (currentPageSize && currentPageSize !== PAGE_SIZE)
      qs.set("pageSize", String(currentPageSize));
    if (serverFilters && serverFilters.length)
      qs.set("filters", encodeURIComponent(JSON.stringify(serverFilters)));
    if (serverSorts && serverSorts.length)
      qs.set("sorts", encodeURIComponent(JSON.stringify(serverSorts)));
    const base = window.location.pathname;
    navigate({ to: base + (qs.toString() ? `?${qs.toString()}` : "") });
  }, [currentPage, currentPageSize, serverFilters, serverSorts, navigate]);

  useEffect(() => {
    syncUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, serverFilters, serverSorts]);

  const loadPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPeople({
        page: currentPage,
        pageSize: currentPageSize,
        sorts: serverSorts,
        filters: serverFilters,
      });
      // Map to include `id` that Table expects
      type Address = {
        City?: { Name?: string; CountryRegion?: string };
        CountryRegion?: string;
      };
      const mapped = (res.data || []).map((pObj: Record<string, unknown>) => {
        const p = pObj as Record<string, unknown> & {
          AddressInfo?: Address[];
          UserName?: string;
        };
        const address =
          Array.isArray(p.AddressInfo) && p.AddressInfo.length
            ? p.AddressInfo[0]
            : null;
        const countryRegion =
          (address && (address.City?.CountryRegion ?? address.CountryRegion)) ??
          "";
        const city = (address && (address.City?.Name ?? "")) ?? "";

        // Deterministic availability based on username char codes
        const computeAvailability = (u?: string) => {
          if (!u) return "Unknown";
          const sum = u
            .split("")
            .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
          return sum % 2 === 0 ? "Available" : "Busy";
        };

        // Count assigned tickets from localStorage if tickets store includes assignedTo/assignee
        type TicketRecord = { [k: string]: unknown } & {
          assignedTo?: string;
          assignee?: string;
          assigned?: string;
          owner?: string;
          user?: string;
        };

        const countAssignedTickets = (userName: string) => {
          const stored = localStorage.getItem("tickets");
          if (!stored) return 0;
          try {
            const parsed = JSON.parse(stored) as TicketRecord[];
            const matches = parsed.filter((t) => {
              const assignees = [
                t.assignedTo,
                t.assignee,
                t.assigned,
                t.owner,
                t.user,
              ]
                .filter(Boolean)
                .map(String);
              return assignees.some(
                (a) => a.toLowerCase() === userName.toLowerCase()
              );
            });
            return matches.length;
          } catch {
            return 0;
          }
        };

        const userName = String(p.UserName ?? "");
        return {
          id: userName,
          ...(p as Record<string, unknown>),
          countryRegion,
          city,
          availability: computeAvailability(userName),
          ticketAssignedCount: countAssignedTickets(userName),
        } as Person;
      }) as Person[];

      setData(mapped);
      setTotal(res.total ?? mapped.length);
    } catch (err) {
      console.error("Failed to load people", err);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentPageSize, serverSorts, serverFilters]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  const handleRefresh = async () => {
    await loadPage();
  };

  const totalPages = Math.max(1, Math.ceil(total / currentPageSize));

  type TableFilter = { field: string; operator: string; value: string };
  type TableSort = { field: string; direction: "asc" | "desc" };

  const mapOperator = (op: string) => {
    switch (op) {
      case "contains":
        return "contains" as const;
      case "starts_with":
        return "startswith" as const;
      case "ends_with":
        return "endswith" as const;
      case "is_not":
        return "ne" as const;
      case "is":
      default:
        return "eq" as const;
    }
  };

  const onFilter = (filters: TableFilter[]) => {
    const converted: ODataFilter[] = (filters || []).map((f) => ({
      field: f.field,
      operator: mapOperator(f.operator),
      value: f.value,
    }));
    setServerFilters(converted);
    setCurrentPage(1);
  };

  const onSort = (sorts: TableSort[]) => {
    const converted = (sorts || []).map((s) => ({
      field: s.field,
      direction: s.direction,
    }));
    setServerSorts(converted);
  };

  const onRowClick = (row: Person) => {
    console.log("Row clicked", row);
  };

  return (
    <MainLayout
      mainContentClassName="people-page"
      leftText="Tasks"
      leftButtonText="Tasks"
      userType="Admin"
      username="Guest"
      rightItems={[]}
    >
      <div className="tasks-page-header">
        <h2>People / Tasks</h2>
      </div>

      <div className="table-full-window">
        <Table
          columns={columns}
          data={data}
          showFilter
          showSort
          showRefresh
          onFilter={onFilter}
          onSort={onSort}
          initialFilters={parsed.filters ?? []}
          initialSorts={parsed.sorts ?? []}
          onRefresh={handleRefresh}
          onRowClick={onRowClick}
        />

        {/* Pagination footer */}
        <div className="table-pagination-footer">
          <div>
            {loading
              ? "Loading..."
              : `Page ${currentPage} of ${totalPages} — ${total} items`}
          </div>
          <div>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
