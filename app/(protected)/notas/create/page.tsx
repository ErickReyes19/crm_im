import { getSessionPermisos } from "@/auth";
import { getClientesAsignadosOpciones } from "@/app/(protected)/clientes/actions";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { Formulario } from "../components/Form";

export default async function CreateNotaPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_notas")) return <NoAcceso />;

  const clientes = await getClientesAsignadosOpciones();

  return <div className="container mx-auto py-2 space-y-4">
    <HeaderComponent Icon={PlusCircle} description="Agrega una nota al cliente con evidencia base64" screenName="Crear nota" />
    <Formulario clientes={clientes} />
  </div>;
}
