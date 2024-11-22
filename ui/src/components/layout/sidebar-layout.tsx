import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import React from "react";

import AppSidebar from "./app-sidebar";
import { Document } from "@prisma/client";
import { cookies } from "next/headers";

type Props = {
  children: React.ReactNode;
  documents: Document[];
  currentDocument: Document;
  currentRoute: "chat" | "document" | "setting";
};

async function SidebarLayout({
  children,
  documents,
  currentDocument,
  currentRoute,
}: Props) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="space-x-1">
      <AppSidebar
        currentRoute={currentRoute}
        currentDocument={currentDocument}
        documents={documents}
      />
      <SidebarInset className="flex h-screen py-2">
        <SidebarTrigger />
        <main className="mx-auto w-[80%] flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default SidebarLayout;
