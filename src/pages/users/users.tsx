import DefaultLayout from "@/config/layout";
import { useEffect, useState } from "react";
import { User } from "@/types/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserDialog } from "@/components/users/user-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LiaAngleLeftSolid } from "react-icons/lia";
import { LiaAngleRightSolid } from "react-icons/lia";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AiOutlineSetting } from "react-icons/ai";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CreateUserDialog } from "@/components/users/create-user-dialog";

interface PaginatedResponse {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roles, setRoles] = useState<{ id: number; name_rol: string }[]>([]);
  const [teams, setTeams] = useState<{ id: number; team_name: string }[]>([]);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: number]: boolean;
  }>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchTeams();
  }, [page, search, roleFilter, teamFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "8",
        ...(search && { search }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(teamFilter !== "all" && { team: teamFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`http://localhost:5000/api/users?${params}`);
      const data: PaginatedResponse = await response.json();
      setUsers(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchRoles = async () => {
    const response = await fetch("http://localhost:5000/api/roles");
    const data = await response.json();
    setRoles(data);
  };

  const fetchTeams = async () => {
    const response = await fetch("http://localhost:5000/api/teams");
    const data = await response.json();
    setTeams(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-red-500";
      case "paused":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getConnectionStatusColor = (status: string | undefined) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      await fetch(`http://localhost:5000/api/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_status: newStatus }),
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleRoleChange = async (userId: number, newRoleId: string) => {
    try {
      await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role_group_id: newRoleId }),
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleTeamChange = async (userId: number, newTeamId: string) => {
    try {
      await fetch(`http://localhost:5000/api/users/${userId}/team`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: newTeamId }),
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating team:", error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "DELETE",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString)
      return <span className="text-gray-400">User not connected</span>;
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Users Manager</h1>
          <p className="text-muted-foreground">
            Agregue, edite o elimine usuarios de su empresa.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(v) => {
              setRoleFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name_rol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={teamFilter}
            onValueChange={(v) => {
              setTeamFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por equipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los equipos</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.team_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>User Login</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Status Connect</TableHead>
                <TableHead>Última Conexión</TableHead>
                <TableHead className="items-center flex pr-5 justify-end">
                  <AiOutlineSetting />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div>
                          {user.name} {user.last_name}
                        </div>
                        <p className="text-xs text-neutral-400">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role_group_id?.toString() || ""}
                      onValueChange={(v) => handleRoleChange(user.id, v)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>{user.name_rol || "Sin rol"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name_rol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={String(user.team_id || "")}
                      onValueChange={(v) => handleTeamChange(user.id, v)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>
                          {user.team_name || "Sin equipo"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={String(team.id)}>
                            {team.team_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.user_status || "inactive"}
                      onValueChange={(v) => handleStatusChange(user.id, v)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>
                          <Badge
                            variant="secondary"
                            className={getStatusColor(user.user_status)}
                          >
                            {user.user_status || "Sin estado"}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                        <SelectItem value="paused">Pausado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${getConnectionStatusColor(
                          user.connection_status
                        )}`}
                      ></div>
                      {user.connection_status}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(user.last_connection)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu
                      open={openDropdowns[user.id]}
                      onOpenChange={(open) => {
                        setOpenDropdowns((prev) => ({
                          ...prev,
                          [user.id]: open,
                        }));
                        if (!open) {
                          setOpenPopoverId(null);
                        }
                      }}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setDialogOpen(true);
                            setOpenDropdowns((prev) => ({
                              ...prev,
                              [user.id]: false,
                            }));
                          }}
                        >
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setOpenDropdowns((prev) => ({
                              ...prev,
                              [user.id]: false,
                            }));
                          }}
                        >
                          Editar
                        </DropdownMenuItem>
                        <div className="relative">
                          <Popover
                            open={openPopoverId === user.id}
                            onOpenChange={(open) => {
                              setOpenPopoverId(open ? user.id : null);
                            }}
                          >
                            <PopoverTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setOpenPopoverId(user.id);
                                }}
                                className="text-red-600"
                              >
                                Eliminar
                              </DropdownMenuItem>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2" side="right">
                              <div className="flex flex-col items-center gap-2">
                                <p className="text-sm font-semibold">
                                  ¿Estás seguro?
                                </p>
                                <p className="text-xs text-gray-500">
                                  Esta acción no se puede deshacer.
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    className="h-6 px-2 text-xs text-red-500"
                                    onClick={() => {
                                      handleDeleteUser(user.id);
                                      setOpenPopoverId(null);
                                      setOpenDropdowns((prev) => ({
                                        ...prev,
                                        [user.id]: false,
                                      }));
                                    }}
                                  >
                                    Eliminar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => {
                                      setOpenPopoverId(null);
                                      setOpenDropdowns((prev) => ({
                                        ...prev,
                                        [user.id]: false,
                                      }));
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <LiaAngleLeftSolid />
          </Button>
          <div className="text-sm">
            Página {page} de {totalPages}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            <LiaAngleRightSolid />
          </Button>
        </div>
      </div>

      <UserDialog
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchUsers}
        roles={roles}
        teams={teams}
      />
    </DefaultLayout>
  );
}
