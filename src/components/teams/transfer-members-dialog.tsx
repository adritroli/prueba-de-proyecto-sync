import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: number;
  name: string;
  avatar?: string;
}

interface TransferMembersDialogProps {
  teamId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function TransferMembersDialog({
  teamId,
  open,
  onOpenChange,
  onSave,
}: TransferMembersDialogProps) {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<number[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchTeamMembers();
    }
  }, [open, teamId]);

  const fetchUsers = async () => {
    const response = await fetch("http://localhost:5000/api/users");
    const data = await response.json();
    setAvailableUsers(data.data);
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/teams/${teamId}/members`
      );
      if (!response.ok) throw new Error("Error fetching team members");
      const data = await response.json();
      setTeamMembers(data);
    } catch (error) {
      console.error("Error:", error);
      setTeamMembers([]);
    }
  };

  const handleSave = async () => {
    const currentMembers = teamMembers.map((m) => m.id);
    const toRemove = selectedTeam;
    const toAdd = selectedAvailable;

    const finalMembers = [
      ...currentMembers.filter((id) => !toRemove.includes(id)),
      ...toAdd,
    ];

    try {
      const response = await fetch(
        `http://localhost:5000/api/teams/${teamId}/members`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberIds: [
              ...currentMembers.filter((id) => !selectedTeam.includes(id)),
              ...selectedAvailable,
            ],
          }),
        }
      );

      if (!response.ok) throw new Error("Error updating team members");

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>Gestionar Miembros del Equipo</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Usuarios Disponibles</h3>
            <ScrollArea className="h-[300px] w-full">
              {availableUsers
                .filter((user) => !teamMembers.find((m) => m.id === user.id))
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                  >
                    <Checkbox
                      checked={selectedAvailable.includes(user.id)}
                      onCheckedChange={(checked) => {
                        setSelectedAvailable(
                          checked
                            ? [...selectedAvailable, user.id]
                            : selectedAvailable.filter((id) => id !== user.id)
                        );
                      }}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </div>
                ))}
            </ScrollArea>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Miembros del Equipo</h3>
            <ScrollArea className="h-[300px] w-full">
              {teamMembers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                >
                  <Checkbox
                    checked={selectedTeam.includes(user.id)}
                    onCheckedChange={(checked) => {
                      setSelectedTeam(
                        checked
                          ? [...selectedTeam, user.id]
                          : selectedTeam.filter((id) => id !== user.id)
                      );
                    }}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
