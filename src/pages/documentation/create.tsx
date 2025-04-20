import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner"

export default function CreateDocumentPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const createEmptyDocument = async () => {
      try {
        // Crear un documento vacío
        const response = await axios.post('http://localhost:5000/api/documentation/documents', {
          title: "Nuevo documento",
          content: "<p>Escribe aquí el contenido de tu documento...</p>",
          space_id: 1, // Por defecto, el primer espacio
          user_id: 1 // En una implementación real, esto vendría del contexto de autenticación
        });

        // Redirigir a la página de edición con el ID del nuevo documento
        navigate(`/documentation/edit/${response.data.id}`);
      } catch (error) {
        console.error("Error al crear documento:", error);
        toast("Error: No se pudo crear el documento");
        // En caso de error, redirigir a la página principal de documentación
        navigate("/documentation");
      }
    };

    createEmptyDocument();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Creando nuevo documento...</p>
      </div>
    </div>
  );
}
