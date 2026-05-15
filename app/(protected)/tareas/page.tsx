import { getSessionPermisos } from "@/auth";
import NoAcceso from "@/components/noAccess";
import HeaderComponent from "@/components/HeaderComponent";
import { ClipboardList } from "lucide-react";
import { getTareas } from "./actions";

export default async function TareasPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_tareas")) return <NoAcceso />;
  const tareas = await getTareas();
  return <div className="container mx-auto py-2"><HeaderComponent Icon={ClipboardList} screenName="Tareas" description="Asignación de tareas" /><div className="rounded-md border p-4 text-sm">Total tareas: {tareas.length}</div></div>;
}
