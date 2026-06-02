import { getSession } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { getUserDisplayName, isSuperAdminSession } from "@/lib/access-scope";
import { StickyNote } from "lucide-react";
import { getNotas } from "./actions";
import { columns, NotaTableRow } from "./components/columns";
import { DataTable } from "./components/data-table";

export default async function NotasPage() {
  const session = await getSession();
  const permisos = session?.Permiso;
  if (!permisos?.includes("ver_notas")) return <NoAcceso />;

  const notas = await getNotas();
  const data: NotaTableRow[] = notas.map((nota) => ({ ...nota, usuarioFiltro: getUserDisplayName(nota.usuario) }));
  const showUserFilter = isSuperAdminSession(session!) || permisos.includes("gestionar_mi_equipo");

  return <div className="container mx-auto py-2 space-y-4"><HeaderComponent Icon={StickyNote} description="Notas comerciales por cliente" screenName="Notas" /><DataTable columns={columns} data={data} userFilter={{ enabled: showUserFilter, placeholder: "Ver notas por usuario" }} /></div>;
}
