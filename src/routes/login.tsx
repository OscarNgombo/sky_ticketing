import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginPage from "../shared/components/pages/LoginPage";
import { isLoggedIn } from "../utils/auth";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo:
      typeof search?.returnTo === "string" ? search.returnTo : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (isLoggedIn()) {
      const target =
        search.returnTo && search.returnTo.startsWith("/")
          ? search.returnTo
          : "/tickets";
      throw redirect({ to: target });
    }
  },
  component: function LoginRouteComponent() {
    let { returnTo } = Route.useSearch();

    if (returnTo?.includes("[object Object]")) {
      returnTo = returnTo.split("[object Object]")[0];
    }

    return <LoginPage returnTo={returnTo} />;
  },
});
