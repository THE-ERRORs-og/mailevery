import { SessionProvider } from "@/context/SessionContext";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import React from "react";

const Layout = async ({ children }) => {
  const session = await auth();
  if (!session || !session.user) redirect("/");
  return (
    <>
      <SessionProvider session={session}>{children}</SessionProvider>
    </>
  );
};

export default Layout;
