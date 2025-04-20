import { Team } from "@/types/teams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamCardProps {
  team: Team;
  onDelete: (teamId: number) => void;
  onManageMembers: (teamId: number) => void;
}

export function TeamCard({ team, onDelete, onManageMembers }: TeamCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{team.team_name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Creado: {new Date(team.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={team.status === "active" ? "default" : "secondary"}
              className={
                team.status === "active"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }
            >
              {team.status === "active" ? "Activo" : "Inactivo"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                <DropdownMenuItem>Editar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManageMembers(team.id)}>
                  Gestionar Miembros
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDelete(team.id)}
                >
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{team.description}</p>
        <div className="flex justify-between items-center">
          {team.members && team.members.length > 0 ? (
            <div className="flex -space-x-2">
              {team.members.slice(0, 3).map((member: any) => (
                <Avatar
                  key={member.id}
                  className="h-8 w-8 border-2 border-background"
                >
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {team.members.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-sm font-medium">
                  +{team.members.length - 3}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No hay miembros en este equipo
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
