import * as React from "react";
import { useEffect, useState } from "react";
import { TbDeviceIpadHorizontalDollar } from "react-icons/tb";

import { FaUserShield } from "react-icons/fa6";

import { ImHome } from "react-icons/im";
import { FaUsersCog } from "react-icons/fa";
import { MdMenuBook } from "react-icons/md";
import { HiMiniInboxStack } from "react-icons/hi2";
import { RiFolderSettingsFill } from "react-icons/ri";
import { IoAlertCircle } from "react-icons/io5";
import { TbDeviceIpadHorizontalCode } from "react-icons/tb";
import { TbDeviceIpadHorizontal } from "react-icons/tb";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { RiLockPasswordFill } from "react-icons/ri";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  user_status: "active" | "inactive" | "paused";
  role_group_id: number;
  team_id: number;
  avatar?: string;
  audit_date?: string;
  modif_date?: string;
  last_name?: string;
  last_connection?: string;
  connection_status?: "online" | "away" | "offline";
  team_name?: string;
  name_rol?: string;
}

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/adrian.jpg",
  },
  teams: [
    {
      name: "ProjectSync Enterprise",
      logo: TbDeviceIpadHorizontalDollar,
      plan: "Enterprise",
    },
    {
      name: "ProjectSync Devs",
      logo: TbDeviceIpadHorizontalCode,
      plan: "Pro Developer",
    },
    {
      name: "ProjectSync Free",
      logo: TbDeviceIpadHorizontal,
      plan: "Free Plan ",
    },
  ],

  navMain: [
    {
      title: "Home",
      url: "#",
      icon: ImHome,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/",
        },
        {
          title: "Kanban Board",
          url: "/kanban",
        },
        {
          title: "Calendar",
          url: "/calendar",
        },
        {
          title: "Pagina de Pruebas",
          url: "/pruebas",
        },
        {
          title: "Widgets Dashboard",
          url: "/widgets",
        },
        {
          title: "Carga de Horas",
          url: "/cargaHoras",
        },
      ],
    },
    {
      title: "Backlog & Sprints",
      url: "#",
      icon: HiMiniInboxStack,
      isActive: false,
      items: [
        {
          title: "Search Tasks",
          url: "/searchTasks",
        },
        {
          title: "BackLog Tasks",
          url: "/tasks",
        },
        {
          title: "Sprints in Progress",
          url: "/sprintActivo",
        },
        {
          title: "Sprints Completed",
          url: "/sprintCerrado",
        },
      ],
    },
    {
      title: "Users & Teams",
      url: "#",
      icon: FaUsersCog,
      items: [
        {
          title: "Users Management",
          url: "/users",
        },
        {
          title: "Teams Settings",
          url: "/teams",
        },
      ],
    },
    {
      title: "Projects",
      url: "#",
      icon: RiFolderSettingsFill,
      items: [
        {
          title: "Projects Settings",
          url: "/projects",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: MdMenuBook,
      items: [
        {
          title: "Documentación",
          url: "/documentation",
        },
        {
          title: "Crear documento",
          url: "/documentation/create",
        },
      ],
    },
    {
      title: "Reclamos",
      url: "#",
      icon: IoAlertCircle,
      items: [
        {
          title: "Create Claim",
          url: "/claims",
        },
        {
          title: "Prueba de Portal",
          url: "/portalClaim",
        },
      ],
    },
    {
      title: "Passwords",
      url: "#",
      icon: RiLockPasswordFill,
      items: [
        {
          title: "Password Management",
          url: "/passwordManager",
        },
      ],
    },
    {
      title: "Roles & Permissions",
      url: "#",
      icon: FaUserShield,
      items: [
        {
          title: "Roles Management",
          url: "/roles",
        },
      ],
    },
  ],
  projects: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = useState<User | null>(null);

  const userDisplayData = {
    name: userData?.username || "Usuario",
    email: userData?.email || "email@ejemplo.com",
    avatar: userData?.avatar || "/avatars/default.png",
    isLoading: !userData,
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData({
          id: user.id,
          name: user.name || user.username || "Usuario",
          username: user.username || user.name || "usuario",
          email: user.email || "email@ejemplo.com",
          user_status: user.user_status || "active",
          role_group_id: user.role_group_id || 0,
          team_id: user.team_id || 0,
          avatar: user.avatar || `/avatars/${user.id}.png`,
          audit_date: user.audit_date,
          modif_date: user.modif_date,
          last_name: user.last_name,
          last_connection: user.last_connection,
          connection_status: user.connection_status,
          team_name: user.team_name,
          name_rol: user.name_rol,
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userDisplayData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
