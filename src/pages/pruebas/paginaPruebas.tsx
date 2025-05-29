import DefaultLayout from "@/config/layout";

export default function PaginaPruebas() {
  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-4">Página de Pruebas</h1>
        <p className="text-lg">Esta es una página de pruebas.</p>
      </div>
    </DefaultLayout>
  );
}
