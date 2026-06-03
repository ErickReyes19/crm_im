import { getSession } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import DateRangeFilter from "@/components/date-range-filter";
import NoAcceso from "@/components/noAccess";
import { getUserDisplayName, isSuperAdminSession } from "@/lib/access-scope";
import { resolveListDateRange } from "@/lib/list-date-range";
import { StickyNote } from "lucide-react";
import { getNotas } from "./actions";
import { columns, NotaTableRow } from "./components/columns";
import { DataTable } from "./components/data-table";

type NotasSearchParams = Promise<{ from?: string; to?: string }>;

export default async function NotasPage({ searchParams }: { searchParams: NotasSearchParams }) {
  const session = await getSession();
  const permisos = session?.Permiso;
  const params = await searchParams;
  const dateRange = resolveListDateRange(params);
  if (!permisos?.includes("ver_notas")) return <NoAcceso />;

  const notas = await getNotas({ from: dateRange.fromInput, to: dateRange.toInput });
  const data: NotaTableRow[] = notas.map((nota) => ({ ...nota, usuarioFiltro: getUserDisplayName(nota.usuario) }));
  const showUserFilter = isSuperAdminSession(session!) || permisos.includes("gestionar_mi_equipo");

  return <div className="container mx-auto py-2 space-y-4"><HeaderComponent Icon={StickyNote} description="Notas comerciales por cliente" screenName="Notas" /><DateRangeFilter from={dateRange.fromInput} to={dateRange.toInput} resetHref="/notas" /><DataTable columns={columns} data={data} userFilter={{ enabled: showUserFilter, placeholder: "Ver notas por usuario" }} /></div>;
}
