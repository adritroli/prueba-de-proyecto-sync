import { GalleryVerticalEnd } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si ya existe una sesión
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
