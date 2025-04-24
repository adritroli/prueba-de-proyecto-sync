import DefaultLayout from "@/config/layout"


export default function CalendarPage() {
 

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Calendario</h1>
        <p className="text-gray-700">Aquí puedes gestionar tus tareas y eventos.</p>
      </div>
    </DefaultLayout>
  );
}
