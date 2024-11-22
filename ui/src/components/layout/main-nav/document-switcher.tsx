"use client";

import React, { useRef } from "react";

import { ChevronsUpDown, File, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";

import { Document } from "@prisma/client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { instance } from "@/lib/instance";

type Props = {
  currentDocument: Document;
  documents: Document[];
};

function DocumentSwitcher({ currentDocument, documents }: Props) {
  const { isMobile } = useSidebar();

  // Ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const router = useRouter();

  // Function to handle file input click
  const handleAddTeamClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the file input
    }
  };

  // Function to handle file selection
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        await instance.post(`/document`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast({
          title: "Document uploaded successfully",
          duration: 1000,
        });
      } catch (error) {
        console.error("Upload failed:", error);
        toast({
          title: "Upload failed",
          description: "Please try again.",
          variant: "destructive",
        });
      } finally {
        router.refresh();
      }
    }
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <File className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentDocument.name}
                </span>
                <span className="truncate text-xs">
                  {new Date(currentDocument.createdAt).toLocaleDateString()} (
                  {new Date(currentDocument.createdAt).toLocaleTimeString()})
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Documents
            </DropdownMenuLabel>

            {documents
              .filter((doc) => doc.id !== currentDocument.id)
              .map((doc, index) => (
                <DropdownMenuItem key={doc.id} className="p-2">
                  <Link
                    className="flex flex-1 gap-2 text-sm"
                    href={`/${doc.id}/chat  `}
                  >
                    <p className="line-clamp-1 flex-1">{doc.name}</p>

                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
              ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleAddTeamClick}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Add Document
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept=".pdf" // Adjust allowed file types as needed
      />
    </SidebarMenu>
  );
}

export default DocumentSwitcher;
