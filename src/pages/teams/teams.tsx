import DefaultLayout from "@/config/layout";
import { useEffect, useState } from "react";
import { Team } from "@/types/teams";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TransferMembersDialog } from "@/components/teams/transfer-members-dialog";
import { toast } from "sonner";
import { TeamCard } from "@/components/teams/team-card";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<
    number | null
  >(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/team");
      const data = await response.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Error al cargar los equipos");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/team/${teamId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      toast.success("Equipo eliminado exitosamente");
      fetchTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Error al eliminar el equipo");
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.team_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DefaultLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Teams Manager</h1>
          <p className="text-muted-foreground">
            Gestione los equipos de su empresa
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Equipo
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar equipos..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Cargando equipos...</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-8">No hay equipos disponibles</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onDelete={handleDeleteTeam}
                onManageMembers={setSelectedTeamForMembers}
              />
            ))}
          </div>
        )}
      </div>

      <TransferMembersDialog
        teamId={selectedTeamForMembers!}
        open={!!selectedTeamForMembers}
        onOpenChange={(open) => !open && setSelectedTeamForMembers(null)}
        onSave={fetchTeams}
      />
    </DefaultLayout>
  );
}
