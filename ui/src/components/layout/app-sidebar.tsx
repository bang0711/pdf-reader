"use client";

import React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { ClearHistory, DocumentSwitcher, MainNav } from "./main-nav";

import { Document } from "@prisma/client";

type Props = {
  documents: Document[];
  currentDocument: Document;
  currentRoute: "chat" | "document" | "setting";
};

function AppSidebar(props: Props & React.ComponentProps<typeof Sidebar>) {
  const { documents, currentDocument, currentRoute, ...sidebarProps } = props;

  return (
    <Sidebar collapsible="icon" {...sidebarProps}>
      <SidebarHeader>
        <DocumentSwitcher
          documents={documents}
          currentDocument={currentDocument}
        />
      </SidebarHeader>

      <SidebarContent>
        <MainNav currentRoute={currentRoute} />
      </SidebarContent>

      <SidebarFooter>
        <ClearHistory />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
