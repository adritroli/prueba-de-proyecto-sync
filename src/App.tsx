import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import LoginPage from "./pages/login/login";
import DashboardPage from "./pages/dashboard/dashboard";
import UsersPage from "./pages/users/users";
import TeamsPage from "./pages/teams/teams";
import ProjectsPage from "./pages/projects/projects";
import TasksPage from "./pages/backlog/tasks";
import SprintActivoPage from "./pages/backlog/sprintActivo";
import SprintCerrado from "./pages/backlog/sprintCerrado";
import KanbanPage from "./pages/backlog/kanban";
import TaskDetailsPage from "./pages/backlog/task-details";
import DocumentationPage from "./pages/documentation/index";
import CreateDocumentationPage from "./pages/documentation/create";
import ViewDocumentationPage from "./pages/documentation/view/[id]";
import EditDocumentationPage from "./pages/documentation/edit/[id]";
import { ErrorBoundary } from "@/components/errorBoundary";
import NewClaimPage from "./pages/claims/new-claim";
import ReclamosPage from "./pages/claims/reclamos";
import { ProtectedRoute } from '@/components/protected-route';
import AccountPage from "./pages/profile/account";
import PortalClaimPage from "./pages/claims/portalClaim";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/portalClaim",
    element: (
      <ProtectedRoute>
        <PortalClaimPage />
      </ProtectedRoute>
    ),  
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute>
        <UsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/account",
    element: (
      <ProtectedRoute>
        <AccountPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/claims",
    element: (
      <ProtectedRoute>
        <ReclamosPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/teams",
    element: (
      <ProtectedRoute>
        <TeamsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/projects",
    element: (
      <ProtectedRoute>
        <ProjectsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tasks",
    element: (
      <ProtectedRoute>
        <TasksPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sprintActivo",
    element: (
      <ProtectedRoute>
        <SprintActivoPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sprintCerrado",
    element: (
      <ProtectedRoute>
        <SprintCerrado />
      </ProtectedRoute>
    ),
  },
  {
    path: "/kanban",
    element: (
      <ProtectedRoute>
        <KanbanPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/task/:taskKey",
    element: (
      <ProtectedRoute>
        <TaskDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/documentation",
    element: (
      <ProtectedRoute>
        <DocumentationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/documentation/create",
    element: (
      <ProtectedRoute>
        <CreateDocumentationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/documentation/view/:id",
    element: (
      <ProtectedRoute>
        <ViewDocumentationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/documentation/edit/:id",
    element: (
      <ProtectedRoute>
        <EditDocumentationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/claims/new",
    element: (
      <ProtectedRoute>
        <NewClaimPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: (
      <ProtectedRoute>
        <Navigate to="/" replace />
      </ProtectedRoute>
    ),
  },
]);

export default function App() {
  // Reemplazar BrowserRouter con RouterProvider
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
