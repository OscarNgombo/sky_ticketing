import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Table from "../../tickets/components/table/Table";
import type {
  Column,
  TableFilter as TableFilterType,
  TableSort as TableSortType,
} from "../../tickets/components/table/Table";
import { fetchPeople } from "../api";
import type { ODataFilter } from "../api";
import { useNavigate } from "@tanstack/react-router";
import "../styles/TasksPage.css";
import { useSetLayout } from "../../../shared/layouts/useSetLayout";
import Dropdown from "../../tickets/components/Dropdown";
import {
  AddIcon,
  SearchIcon,
  NotificationIcon,
  UserIcon,
  InfoIcon,
} from "../../../shared/icons/icons";
import { getCurrentUser } from "../../../utils/auth";
import Button from "../../../shared/components/buttons/Button";
import { decryptData } from "../../../utils/crypto";

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

interface TicketForDropdown {
  id: string | number;
  problem?: string;
  [key: string]: unknown;
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
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);
  const currentUser = getCurrentUser() ?? undefined;
  const isVendor = (currentUser?.userType || "").toLowerCase() === "vendor";
  const [saccoFilter, setSaccoFilter] = useState("");

  // Assigned tasks mapping: username -> [ticketIds]
  type AssignmentsMap = Record<string, string[]>;
  const ASSIGNED_TASKS_KEY = "assignedTasks";
  const loadAssignments = (): AssignmentsMap => {
    try {
      const raw = localStorage.getItem(ASSIGNED_TASKS_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object"
        ? (parsed as AssignmentsMap)
        : {};
    } catch {
      return {};
    }
  };
  const saveAssignments = (map: AssignmentsMap) => {
    localStorage.setItem(ASSIGNED_TASKS_KEY, JSON.stringify(map));
  };

  const [assignments, setAssignments] = useState<AssignmentsMap>(() =>
    loadAssignments()
  );

  const rightNavItems = useMemo(() => {
    const items: React.ReactNode[] = [
      <div
        key="add"
        onClick={() => navigateRef.current({ to: "/createTicket" })}
        style={{ cursor: "pointer" }}
      >
        <AddIcon />
      </div>,
      <div key="search" title="Coming Soon" style={{ cursor: "pointer" }}>
        <SearchIcon />
      </div>,
    ];
    if (isVendor) {
      items.push(
        <Dropdown
          key="sacco-filter"
          options={[
            "Apstar SACCO",
            "Mwalimu SACCO",
            "Defence SACCO",
            "Wetu SACCO",
          ]}
          value={saccoFilter}
          onChange={(e) => setSaccoFilter(e.target.value)}
          placeholder="Apstar SACCO Limited"
          showIcon={false}
        />
      );
    }
    items.push(
      <div
        key="notifications"
        title="Coming Soon"
        style={{ cursor: "pointer" }}
      >
        <NotificationIcon />
      </div>,
      <div key="user" title="Coming Soon" style={{ cursor: "pointer" }}>
        <UserIcon />
      </div>
    );
    return items;
  }, [saccoFilter, isVendor]);

  // Configure layout for this page
  useSetLayout({
    leftText: currentUser?.company || "Help Desk",
    leftButtonText: currentUser?.userType || "CLIENT",
    rightItems: rightNavItems,
    mainContentClassName: "people-page",
  });

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
  }, [syncUrl]);

  // Helper: get all ticket IDs that are currently assigned to any user
  const getAllAssignedTicketIds = useCallback(() => {
    const allAssignedIds = new Set<string>();
    Object.values(assignments).forEach((ticketIds) => {
      if (Array.isArray(ticketIds)) {
        ticketIds.forEach((id) => allAssignedIds.add(id));
      }
    });
    return allAssignedIds;
  }, [assignments]);

  // Helper: count assigned tickets for a username using assignments map
  const countAssignedTickets = useCallback(
    (userName: string) => {
      const list = assignments[userName] || [];
      return Array.isArray(list) ? list.length : 0;
    },
    [assignments]
  );

  const loadPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPeople({
        page: currentPage,
        pageSize: currentPageSize,
        sorts: serverSorts,
        filters: serverFilters,
      });
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

        const userName = String(p.UserName ?? "");
        const assignedCount = countAssignedTickets(userName);
        const availability = assignedCount > 1 ? "Busy" : "Available";

        return {
          id: userName,
          ...(p as Record<string, unknown>),
          countryRegion,
          city,
          availability,
          ticketAssignedCount: assignedCount,
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
  }, [
    currentPage,
    currentPageSize,
    serverSorts,
    serverFilters,
    countAssignedTickets,
  ]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  const handleRefresh = async () => {
    const freshAssignments = loadAssignments();
    setAssignments(freshAssignments);
    await loadPage();

    if (assignOpen && selectedPerson) {
      const assignedTicketIds = getAllAssignedTicketIds();

      try {
        const enc = localStorage.getItem("tickets");
        const options: { id: string; label: string }[] = [];
        if (enc) {
          try {
            const decrypted = decryptData(enc);
            if (decrypted) {
              const parsed = JSON.parse(decrypted) as TicketForDropdown[];
              for (const t of parsed) {
                const id = String(t.id);
                if (!assignedTicketIds.has(id)) {
                  const label = `#${id} - ${t.problem || "Ticket"}`;
                  options.push({ id, label });
                }
              }
            }
          } catch {
            try {
              const parsed = JSON.parse(enc || "[]") as TicketForDropdown[];
              for (const t of parsed) {
                const id = String(t.id);
                if (!assignedTicketIds.has(id)) {
                  const label = `#${id} - ${t.problem || "Ticket"}`;
                  options.push({ id, label });
                }
              }
            } catch {
              console.warn("Failed to parse tickets from localStorage");
            }
          }
        }
        setAvailableTicketOptions(options);
      } catch (error) {
        console.error("Error refreshing tickets for assignment:", error);
      }
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / currentPageSize));

  type TableFilter = TableFilterType<Person>;
  type TableSort = TableSortType<Person>;

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
      field: s.field as string,
      direction: (s.direction as string) === "desc" ? "desc" : "asc",
    })) as { field: string; direction: "asc" | "desc" }[];
    setServerSorts(converted);
  };

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [availableTicketOptions, setAvailableTicketOptions] = useState<
    { id: string; label: string }[]
  >([]);

  const openAssignModal = useCallback(
    (person: Person) => {
      if (!isVendor) return;
      setSelectedPerson(person);
      setSelectedTicketId("");

      const assignedTicketIds = getAllAssignedTicketIds();

      try {
        const enc = localStorage.getItem("tickets");
        const options: { id: string; label: string }[] = [];
        if (enc) {
          try {
            const decrypted = decryptData(enc);
            if (decrypted) {
              const parsed = JSON.parse(decrypted) as TicketForDropdown[];
              for (const t of parsed) {
                const id = String(t.id);
                if (!assignedTicketIds.has(id)) {
                  const label = `#${id} - ${t.problem || "Ticket"}`;
                  options.push({ id, label });
                }
              }
            }
          } catch {
            try {
              const parsed = JSON.parse(enc || "[]") as TicketForDropdown[];
              for (const t of parsed) {
                const id = String(t.id);
                if (!assignedTicketIds.has(id)) {
                  const label = `#${id} - ${t.problem || "Ticket"}`;
                  options.push({ id, label });
                }
              }
            } catch {
              console.warn("Failed to parse tickets from localStorage");
            }
          }
        }
        setAvailableTicketOptions(options);
      } catch (error) {
        console.error("Error loading tickets for assignment:", error);
        setAvailableTicketOptions([]);
      }
      setAssignOpen(true);
    },
    [isVendor, getAllAssignedTicketIds]
  );

  const addAssignment = () => {
    if (!selectedPerson || !selectedTicketId) return;

    const assignedTicketIds = getAllAssignedTicketIds();
    if (assignedTicketIds.has(selectedTicketId)) {
      alert(
        `Ticket #${selectedTicketId} is already assigned to another person.`
      );
      return;
    }

    const username = selectedPerson.UserName;
    const next = { ...assignments } as AssignmentsMap;
    const current = Array.isArray(next[username]) ? next[username].slice() : [];

    if (!current.includes(selectedTicketId)) {
      current.push(selectedTicketId);
    }

    next[username] = current;
    setAssignments(next);
    saveAssignments(next);

    setSelectedTicketId("");

    const updatedAssignedIds = getAllAssignedTicketIds();
    updatedAssignedIds.add(selectedTicketId);

    setAvailableTicketOptions((prev) =>
      prev.filter((option) => !updatedAssignedIds.has(option.id))
    );

    loadPage();
  };

  const removeAssignment = (ticketId: string) => {
    if (!selectedPerson) return;
    const username = selectedPerson.UserName;
    const next = { ...assignments } as AssignmentsMap;
    next[username] = (next[username] || []).filter((t) => t !== ticketId);
    setAssignments(next);
    saveAssignments(next);

    if (assignOpen) {
      try {
        const enc = localStorage.getItem("tickets");
        if (enc) {
          let ticketFound = false;
          try {
            const decrypted = decryptData(enc);
            if (decrypted) {
              const parsed = JSON.parse(decrypted) as TicketForDropdown[];
              const ticket = parsed.find((t) => String(t.id) === ticketId);
              if (ticket) {
                const label = `#${ticketId} - ${ticket.problem || "Ticket"}`;
                setAvailableTicketOptions((prev) =>
                  [...prev, { id: ticketId, label }].sort((a, b) =>
                    a.id.localeCompare(b.id)
                  )
                );
                ticketFound = true;
              }
            }
          } catch {
            const parsed = JSON.parse(enc || "[]") as TicketForDropdown[];
            const ticket = parsed.find((t) => String(t.id) === ticketId);
            if (ticket) {
              const label = `#${ticketId} - ${ticket.problem || "Ticket"}`;
              setAvailableTicketOptions((prev) =>
                [...prev, { id: ticketId, label }].sort((a, b) =>
                  a.id.localeCompare(b.id)
                )
              );
              ticketFound = true;
            }
          }

          if (!ticketFound) {
            const label = `#${ticketId} - Ticket`;
            setAvailableTicketOptions((prev) =>
              [...prev, { id: ticketId, label }].sort((a, b) =>
                a.id.localeCompare(b.id)
              )
            );
          }
        }
      } catch (error) {
        console.warn("Error adding removed ticket back to options:", error);
      }
    }

    loadPage();
  };

  const onRowClick = (row: Person) => {
    if (isVendor) {
      openAssignModal(row);
    }
  };

  const getRowClassName = (person: Person): string | undefined => {
    if (person.availability === "Busy") {
      return "person-row-busy";
    } else if (person.availability === "Available") {
      return "person-row-available";
    }
    return undefined;
  };

  return (
    <>
      <div className="tasks-page-header">
        <h2>People / Tasks</h2>
      </div>

      <div className="table-full-window">
        <Table
          columns={columns}
          data={data}
          onFilter={onFilter}
          onSort={onSort}
          initialFilters={parsed.filters ?? []}
          initialSorts={parsed.sorts ?? []}
          onRefresh={handleRefresh}
          onRowClick={onRowClick}
          getRowClassName={getRowClassName}
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
      {isVendor && assignOpen && selectedPerson && (
        <div
          className="reusable-modal-overlay"
          onClick={() => setAssignOpen(false)}
        >
          <div
            className="reusable-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reusable-modal-header">
              <div className="reusable-modal-title">
                <InfoIcon />
                <span>Assign Tickets to {selectedPerson.UserName}</span>
              </div>
              <button
                className="reusable-modal-close"
                title="Close"
                onClick={() => setAssignOpen(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.0001 16.6667C6.32508 16.6667 3.33341 13.675 3.33341 10C3.33341 6.32502 6.32508 3.33335 10.0001 3.33335C13.6751 3.33335 16.6667 6.32502 16.6667 10C16.6667 13.675 13.6751 16.6667 10.0001 16.6667ZM10.0001 1.66669C5.39175 1.66669 1.66675 5.39169 1.66675 10C1.66675 14.6084 5.39175 18.3334 10.0001 18.3334C14.6084 18.3334 18.3334 14.6084 18.3334 10C18.3334 5.39169 14.6084 1.66669 10.0001 1.66669ZM12.1584 6.66669L10.0001 8.82502L7.84175 6.66669L6.66675 7.84169L8.82508 10L6.66675 12.1584L7.84175 13.3334L10.0001 11.175L12.1584 13.3334L13.3334 12.1584L11.1751 10L13.3334 7.84169L12.1584 6.66669Z"
                    fill="#FF3B30"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="reusable-modal-body">
              <label>Select Ticket</label>
              {availableTicketOptions.length === 0 ? (
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                    marginBottom: "12px",
                    textAlign: "center",
                    color: "#666",
                  }}
                >
                  No unassigned tickets available
                </div>
              ) : (
                <div className="assign-ticket-row">
                  <select
                    value={selectedTicketId}
                    onChange={(e) => setSelectedTicketId(e.target.value)}
                  >
                    <option value="">-- Select a ticket --</option>
                    {availableTicketOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="primary"
                    onClick={addAssignment}
                    disabled={!selectedTicketId}
                  >
                    Add
                  </Button>
                </div>
              )}
              <div className="assigned-tickets-list">
                <strong>Assigned Ticket IDs</strong>
                <ul style={{ marginTop: 8 }}>
                  {(assignments[selectedPerson.UserName] || []).map((tid) => (
                    <li
                      key={tid}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span>#{tid}</span>
                      <Button
                        variant="secondary"
                        onClick={() => removeAssignment(tid)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                  {!(assignments[selectedPerson.UserName] || []).length && (
                    <li>None</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="reusable-modal-footer">
              <Button variant="secondary" onClick={() => setAssignOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  setAssignOpen(false);
                  await loadPage();
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
