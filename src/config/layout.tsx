import React from "react";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import "@/styles/layout.css";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/teams": "Teams",
  "/projects": "Projects",
  "/backlog": "Backlog",
  "/kanban": "Kanban",
  "/account": "Account Settings",
  "/timesheet": "Timesheet",
  "/task/": "Task Details",
  "/tickets": "Backlog",
  "/sprint": "Sprint",
  "/pruebas": "Pruebas",
  "/calendar": "Calendar",
  "/rolePermissions": "Role Permissions",
};

export default  function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen w-full overflow-hidden">
        <header className="flex  h-12  pt-1 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 pr-4">
            <NotificationsBell userId={parseInt(localStorage.getItem("userId") || "1")} />
            <ModeToggle />
          </div>
        </header>
        <div className="layout-content">
          <div className="layout-content-main">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
