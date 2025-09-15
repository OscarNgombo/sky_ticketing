import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import MainLayout from "../shared/layouts/MainLayout";
import { useEffect, useState } from "react";
import { decryptData } from "../utils/crypto";
import { isLoggedIn } from "../utils/auth";
import { LayoutProvider, useLayout } from "../shared/layouts/LayoutContext";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    if (!isLoggedIn()) {
      const returnTo = `${location.pathname}${location.search ?? ""}`;
      throw redirect({ to: "/login", search: { returnTo } as any });
    }
  },
  component: RouteComponent,
});

function Shell({ user }: { user: { userType: string; username: string } }) {
  const { layout } = useLayout();
  return (
    <MainLayout
      leftText={layout.leftText}
      leftButtonText={layout.leftButtonText}
      userType={user.userType}
      username={user.username}
      rightItems={layout.rightItems}
      mainContentClassName={layout.mainContentClassName}
    >
      <Outlet />
    </MainLayout>
  );
}

function RouteComponent() {
  const [user, setUser] = useState({
    userType: "Client",
    username: "User",
  });

  useEffect(() => {
    const encryptedUser = localStorage.getItem("loggedInUser");
    if (encryptedUser) {
      const decryptedUser = decryptData(encryptedUser);
      if (decryptedUser) {
        try {
          const parsedUser = JSON.parse(decryptedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse user data:", error);
        }
      }
    }
  }, []);

  return (
    <LayoutProvider>
      <Shell user={user} />
    </LayoutProvider>
  );
}
