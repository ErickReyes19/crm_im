import { getSession } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import DateRangeFilter from "@/components/date-range-filter";
import NoAcceso from "@/components/noAccess";
import { getUserDisplayName, isSuperAdminSession } from "@/lib/access-scope";
import { resolveListDateRange } from "@/lib/list-date-range";
import { ClipboardList } from "lucide-react";
import { getTareas } from "./actions";
import { columns, TareaTableRow } from "./components/columns";
import { DataTable } from "./components/data-table";

type TareasSearchParams = Promise<{ from?: string; to?: string }>;

export default async function TareasPage({ searchParams }: { searchParams: TareasSearchParams }) {
  const session = await getSession();
  const permisos = session?.Permiso;
  const params = await searchParams;
  const dateRange = resolveListDateRange(params);
  if (!permisos?.includes("ver_tareas")) return <NoAcceso />;

  const tareas = await getTareas({ from: dateRange.fromInput, to: dateRange.toInput });
  const data: TareaTableRow[] = tareas.map((t) => ({ ...t, descripcion: t.descripcion ?? null, usuarioFiltro: getUserDisplayName(t.usuario) }));
  const showUserFilter = isSuperAdminSession(session!) || permisos.includes("gestionar_mi_equipo");

  return <div className="container mx-auto py-2 space-y-4"><HeaderComponent Icon={ClipboardList} description="Tareas de seguimiento por fecha" screenName="Tareas" /><DateRangeFilter from={dateRange.fromInput} to={dateRange.toInput} baseHref="/tareas" /><DataTable columns={columns} data={data} userFilter={{ enabled: showUserFilter, placeholder: "Ver tareas por usuario" }} /></div>;
}
