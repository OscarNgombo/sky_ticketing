import { Outlet, createFileRoute } from "@tanstack/react-router";
import MainLayout from "../features/tickets/shared/layouts/MainLayout";
import { useEffect, useState } from "react";
import { decryptData } from "../utils/crypto";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  const [user, setUser] = useState({
    userType: "Admin",
    username: "John Doe",
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

  const rightItems = [
    <a key="1" href="#">
      Item 1
    </a>,
    <a key="2" href="#">
      Item 2
    </a>,
  ];

  return (
    <MainLayout
      leftText="Sky Ticketing"
      leftButtonText="New Ticket"
      userType={user.userType}
      username={user.username}
      rightItems={rightItems}
    >
      <Outlet />
    </MainLayout>
  );
}
