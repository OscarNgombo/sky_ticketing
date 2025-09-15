import { createFileRoute, redirect } from "@tanstack/react-router";
import { isLoggedIn } from "../utils/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (isLoggedIn()) {
      throw redirect({ to: "/tickets" });
    }
    throw redirect({ to: "/login", search: {} as any });
  },
  component: () => null,
});
