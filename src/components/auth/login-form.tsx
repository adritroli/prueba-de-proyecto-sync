import { useAuth } from "./auth-provider";
import { useState } from "react";
// ...existing imports...

export function LoginForm() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const identifier = formData.get("email") as string; // o el nombre del campo que uses
      const password = formData.get("password") as string;

      console.log("Submitting login:", { identifier });

      await login(identifier, password);
    } catch (err) {
      console.error("Error en login:", err);
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {/* ...resto del formulario... */}
    </form>
  );
}
