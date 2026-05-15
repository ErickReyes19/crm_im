import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";

export default async function CreateTareaPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_tarea")) return <NoAcceso />;

  return <HeaderComponent Icon={PlusCircle} screenName="Crear tarea" description="Formulario para crear tareas (pendiente UI detallada)." />;
}
