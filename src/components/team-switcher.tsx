import * as React from "react"
import { ChevronsUpDown, Plus, UserPlus, Calendar, ListTodo, Trello, Users, LayoutDashboard, FileText } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  const handleCreateTask = () => {
    window.location.href = "/tasks"
  }

  const handleCreateSprint = () => {
    window.location.href = "/backlog?createSprint=true"
  }

  const handleCreateUser = () => {
    window.location.href = "/users"
  }

  const navigateTo = (path: string) => {
    window.location.href = path
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <team.logo className="size-3.5 shrink-0" />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Crear Nuevo
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 p-2" onClick={handleCreateTask}>
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <ListTodo className="size-3.5 shrink-0" />
                </div>
                <div className="font-medium">Crear Tarea</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 p-2" onClick={handleCreateSprint}>
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Calendar className="size-3.5 shrink-0" />
                </div>
                <div className="font-medium">Crear Sprint</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 p-2" onClick={handleCreateUser}>
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <UserPlus className="size-3.5 shrink-0" />
                </div>
                <div className="font-medium">Crear Usuario</div>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Ir a
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 p-2" onClick={() => navigateTo("/tasks")}>
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <ListTodo className="size-3.5 shrink-0" />
                </div>
                <div className="font-medium">Tareas</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 p-2" onClick={() => navigateTo("/backlog/sprintActivo")}>
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Calendar className="size-3.5 shrink-0" />
                </div>
                <div className="font-medium">Sprint Activo</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 p-2" onClick={() => navigateTo("/kanban")}>
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Trello className="size-3.5 shrink-0" />
                </div>
                <div className="font-medium">Tablero Kanban</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 p-2" onClick={() => navigateTo("/documentation")}>
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <FileText className="size-3.5 shrink-0" />
                </div>
                <div className="font-medium">Documentación</div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
