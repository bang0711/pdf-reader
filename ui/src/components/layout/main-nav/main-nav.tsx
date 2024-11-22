import { FileArchive, MessageCircle, Settings } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { useParams } from "next/navigation";

type Props = {
  currentRoute: "chat" | "document" | "setting";
};

function MainNav({ currentRoute = "chat" }: Props) {
  const isChatRoute = currentRoute === "chat";
  const isDocumentRoute = currentRoute === "document";
  const isSettingRoute = currentRoute === "setting";

  const params = useParams();
  const { documentId } = params;
  return (
    <SidebarGroup>
      <SidebarMenu className="space-y-2">
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className={`transition-all duration-300 ${isChatRoute && "bg-sidebar-accent"}`}
            tooltip={"Chat"}
          >
            <Link href={`/${documentId}/chat`}>
              <MessageCircle />
              Chat
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            className={`transition-all duration-300 ${isDocumentRoute && "bg-sidebar-accent"}`}
            tooltip={"Document"}
            asChild
          >
            <Link href={`/${documentId}/document`}>
              <FileArchive />
              Document
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            className={`transition-all duration-300 ${isSettingRoute && "bg-sidebar-accent"}`}
            tooltip={"Setting"}
            asChild
          >
            <Link href={`/${documentId}/setting`}>
              <Settings />
              Setting
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default MainNav;
