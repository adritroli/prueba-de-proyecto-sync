import * as React from "react";
import { useEffect, useState } from "react";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  LucideIcon,
} from "lucide-react";
import { ImHome } from "react-icons/im";
import { FaUsersCog } from "react-icons/fa";
import { MdMenuBook } from "react-icons/md";
import { HiMiniInboxStack } from "react-icons/hi2";
import { RiFolderSettingsFill } from "react-icons/ri";
import { IoAlertCircle } from "react-icons/io5";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
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
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
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
      ],
    },
    {
      title: "Backlog",
      url: "#",
      icon: HiMiniInboxStack,
      isActive: true,
      items: [
        {
          title: "Tasks Pending",
          url: "/tasks",
        },
        {
          title: "Sprint in Progress",
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
        }
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
  ],
  projects: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = useState<User | null>(null);

  const userDisplayData = {
    name: userData?.username || "Usuario",
    email: userData?.email || "email@ejemplo.com",
    avatar: userData?.avatar || "/avatars/default.png",
    isLoading: !userData
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData({
          id: user.id,
          username: user.username || user.name,
          email: user.email,
          avatar: user.avatar || `/avatars/${user.id}.png`
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
