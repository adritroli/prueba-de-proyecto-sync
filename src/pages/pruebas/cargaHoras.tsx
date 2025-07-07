import DefaultLayout from "@/config/layout";

export default function CargaHorasPage() {
  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-3xl font-bold mb-4">Carga de Horas</h1>
        <div className="w-full max-w-2xl">
          <p className="text-lg mb-4">
            Esta página es una prueba de carga de horas. Aquí puedes registrar
            las horas trabajadas en diferentes tareas o proyectos.
          </p>
          <p className="text-md text-gray-600">
            Para más información, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </DefaultLayout>
  );
}
