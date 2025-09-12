export const API_BASE_URL =
  "https://services.odata.org/TripPinRESTierService/(S(txgzuyguqicvbxfmod212gyk))/People";

export type ODataFilter = {
  field: string;
  operator: "contains" | "eq" | "ne" | "startswith" | "endswith";
  value: string;
};

function encodeODataFilter(filters: ODataFilter[]) {
  if (!filters || !filters.length) return "";
  return filters
    .map((f) => {
      const v = f.value.replace(/'/g, "''");
      switch (f.operator) {
        case "contains":
          return `contains(${f.field}, '${v}')`;
        case "startswith":
          return `startswith(${f.field}, '${v}')`;
        case "endswith":
          return `endswith(${f.field}, '${v}')`;
        case "ne":
          return `${f.field} ne '${v}'`;
        case "eq":
        default:
          return `${f.field} eq '${v}'`;
      }
    })
    .join(" and ");
}

export function buildPeopleUrl({
  page = 1,
  pageSize = 10,
  sorts = [],
  filters = [],
}: {
  page?: number;
  pageSize?: number;
  sorts?: { field: string; direction: "asc" | "desc" }[];
  filters?: ODataFilter[];
}) {
  const qs = new URLSearchParams();

  // OData uses $skip and $top for pagination
  const skip = (page - 1) * pageSize;
  qs.set("$skip", String(skip));
  qs.set("$top", String(pageSize));

  if (sorts && sorts.length) {
    const orderBy = sorts.map((s) => `${s.field} ${s.direction}`).join(",");
    qs.set("$orderby", orderBy);
  }

  const f = encodeODataFilter(filters as ODataFilter[]);
  if (f) qs.set("$filter", f);

  // Request count so we can compute total pages
  qs.set("$count", "true");

  return `${API_BASE_URL}?${qs.toString()}`;
}

export async function fetchPeople({
  page = 1,
  pageSize = 10,
  sorts = [],
  filters = [],
}: {
  page?: number;
  pageSize?: number;
  sorts?: { field: string; direction: "asc" | "desc" }[];
  filters?: ODataFilter[];
}) {
  const url = buildPeopleUrl({ page, pageSize, sorts, filters });
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch people: ${res.status}`);
  }
  const json = await res.json();
  // OData returns { value: [...], '@odata.count': N }
  const total = json["@odata.count"] ?? (json.value ? json.value.length : 0);
  return {
    data: json.value ?? [],
    total,
  };
}
