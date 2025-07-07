import DefaultLayout from "@/config/layout";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "sonner";

export default function PaginaPruebas() {
  return (
    <DefaultLayout>
      <Toaster />

      <div>
        <h1>Pagina de pruebas</h1>
        <p>
          Esta es una página de pruebas para verificar el funcionamiento del
          sistema.
        </p>
        <p>Prueba de carga de horas, widgets y notificaciones.</p>
        <Button onClick={() => toast.success("¡Prueba exitosa!")}>
          Probar Notificación
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="mt-4">
              <Settings2 className="mr-2" />
              Configuración de Widgets
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <span className="text-sm">Mostrar widgets</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="text-sm">Ocultar widgets</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <Button
          onClick={() => toast.error("Funcionalidad aún no implementada")}
          className="mt-4"
        >
          Funcionalidad no implementada
        </Button>
      </div>
    </DefaultLayout>
  );
}
