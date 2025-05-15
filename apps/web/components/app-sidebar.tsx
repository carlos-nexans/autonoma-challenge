'use client';

import * as React from "react";
import { Bot, EditIcon, ArchiveIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Threads } from "@repo/api";
import { useThreads } from "@/hooks/useThreads";
import { Button } from "./ui/button";
import { NavLink, useNavigate } from "react-router";

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  currentThread?: string;
};

export function AppSidebar({ currentThread, ...props }: React.ComponentProps<typeof Sidebar> & AppSidebarProps) {
  const { threads, newThread, deleteThread } = useThreads();
  const navigate = useNavigate();

  const handleArchive = async (threadId: string) => {
    try {
      await deleteThread(threadId);
    } catch (error) {
      console.error('Failed to archive thread:', error);
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Bot className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Home</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
          <SidebarMenuButton size="default" asChild>
          <Button variant="default" className="w-full cursor-pointer" onClick={newThread}>
              <EditIcon className="size-4" />
              <span className="font-medium">
                New conversation
              </span>
            </Button>
            </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {threads?.length ? (
              <SidebarMenuItem className="mx-0 px-0">
                <SidebarMenuButton asChild>
                  <span className="font-medium">
                    Conversaciones
                  </span>
                </SidebarMenuButton>
                <SidebarMenuSub className="mx-0 px-0 border-0 gap-1">
                  {threads.map((thread: Threads[0]) => (
                    <SidebarMenuSubItem key={thread.id}>
                      <div className="flex items-center justify-between w-full">
                        <SidebarMenuSubButton asChild className="flex-1 block whitespace-normal break-words py-2 px-2 h-auto">
                          <NavLink to={`/chat/${thread.id}`}>{thread.title}</NavLink>
                        </SidebarMenuSubButton>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 mr-2 hover:bg-transparent cursor-pointer hover:text-blue-600"
                          onClick={(e) => {
                            e.preventDefault();
                            handleArchive(thread.id);
                            if (thread.id === currentThread) {
                              navigate("/");
                            }
                          }}
                        >
                          <ArchiveIcon className="h-4 w-4" />
                          <span className="sr-only">Archive thread</span>
                        </Button>
                      </div>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            ) : null}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  );
}
