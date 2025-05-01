'use client';

import * as React from "react"
import { Bot, GalleryVerticalEnd } from "lucide-react"

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
} from "@/components/ui/sidebar"
import { Threads } from "@repo/api";
import { useThreads } from "@/hooks/useThreads";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { threads } = useThreads();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Bot className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Chat assistant</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {threads?.length ? (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <span className="font-medium">
                    Conversaciones
                  </span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {threads.map((thread: Threads[0]) => (
                    <SidebarMenuSubItem key={thread.id}>
                      <SidebarMenuSubButton asChild>
                        <a href={`/chat/${thread.id}`}>{thread.title}</a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            ) : null}
            {!threads?.length ? (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <span className="font-medium">
                    No conversations yet
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
