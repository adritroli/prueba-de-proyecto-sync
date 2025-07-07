import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { ProjectCard } from "./project-card";

test("muestra el nombre y código del proyecto", () => {
  render(
    <ProjectCard
      project={{
        id: 1,
        name: "Proyecto Demo",
        code: "DEMO",
        description: "Descripción",
        status: "active",
        tasks_count: 10,
        completed_tasks: 5,
        team_name: "Equipo 1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      }}
    />
  );
  expect(screen.getByText("Proyecto Demo")).toBeInTheDocument();
  expect(screen.getByText(/Código: DEMO/)).toBeInTheDocument();
});
