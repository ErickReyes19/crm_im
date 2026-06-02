import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { ClipboardList } from "lucide-react";
import { getTareas } from "./actions";
import { columns, TareaTableRow } from "./components/columns";
import { DataTable } from "./components/data-table";

function getUsuarioLabel(usuario: TareaTableRow["usuario"]) {
  return usuario.nombre ? `${usuario.nombre} (${usuario.usuario})` : usuario.usuario;
}

export default async function TareasPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_tareas")) return <NoAcceso />;
  const tareas = await getTareas();
  const data: TareaTableRow[] = tareas.map((t) => ({ ...t, descripcion: t.descripcion ?? null }));
  const isSuperAdmin = permisos.includes("super_admin");
  return <div className="container mx-auto py-2 space-y-4"><HeaderComponent Icon={ClipboardList} description="Tareas de seguimiento por fecha" screenName="Tareas" /><DataTable columns={columns} data={data} userFilter={{ enabled: isSuperAdmin, getUserName: (row) => getUsuarioLabel(row.usuario) }} /></div>;
}
