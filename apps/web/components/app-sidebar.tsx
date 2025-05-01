'use client';

import * as React from "react";
import { Bot, EditIcon } from "lucide-react";

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
import Link from "next/link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { threads, newThread } = useThreads();

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
            <Button variant="default" className="w-full cursor-pointer" onClick={newThread}>
              <EditIcon className="size-4" />
              <span className="font-medium">
                New conversation
              </span>
            </Button>
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
                      <SidebarMenuSubButton asChild className="block w-full whitespace-normal break-words py-2 px-2 h-auto">
                        <Link href={`/chat/${thread.id}`}>{thread.title}</Link>
                      </SidebarMenuSubButton>
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
  )
}
