
import DefaultLayout from "@/config/layout"

export default function CalendarPage() {
  return (
    <DefaultLayout>

        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Calendario</h1>
            <p className="text-muted-foreground">Aquí puedes ver y gestionar tus eventos y tareas en un calendario interactivo.</p>
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Eventos</h2>
                <p className="text-muted-foreground">No hay eventos programados.</p>
            </div>
            </div>


            </DefaultLayout>
  )
}
