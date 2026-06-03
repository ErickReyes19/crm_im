import { getSession } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import DateRangeFilter from "@/components/date-range-filter";
import NoAcceso from "@/components/noAccess";
import { getUserDisplayName, isSuperAdminSession } from "@/lib/access-scope";
import { resolveListDateRange } from "@/lib/list-date-range";
import { ListCheck } from "lucide-react";
import { getVentas } from "./actions";
import VentasListMobile from "./components/ventas-list-mobile";
import { DataTable } from "./components/data-table";
import { columns, VentaTableRow } from "./components/columns";

type VentasSearchParams = Promise<{ from?: string; to?: string }>;

export default async function VentasPage({ searchParams }: { searchParams: VentasSearchParams }) {
  const session = await getSession();
  const permisos = session?.Permiso;
  const params = await searchParams;
  const dateRange = resolveListDateRange(params);
  if (!permisos?.includes("ver_ventas")) return <NoAcceso />;

  const puedeEditar = permisos.includes("editar_venta");
  const showUserFilter = isSuperAdminSession(session!) || permisos.includes("gestionar_mi_equipo");
  const data: VentaTableRow[] = (await getVentas({ from: dateRange.fromInput, to: dateRange.toInput })).map((venta: Awaited<ReturnType<typeof getVentas>>[number]) => ({ ...venta, canEditEstado: puedeEditar, total: Number(venta.total), usuarioFiltro: getUserDisplayName(venta.usuario), productos: venta.productos.map((detalle) => ({ ...detalle, precioUnitario: Number(detalle.precioUnitario), subtotal: Number(detalle.subtotal) })) }));
  const userFilter = { enabled: showUserFilter, placeholder: "Ver ventas por vendedor" };

  return (
    <div className="container mx-auto space-y-4 py-2">
      <HeaderComponent Icon={ListCheck} description="En este apartado podrá ver todas las ventas" screenName="Ventas" />
      <DateRangeFilter from={dateRange.fromInput} to={dateRange.toInput} resetHref="/ventas" />
      <div className="hidden md:block"><DataTable columns={columns} data={data} userFilter={userFilter} /></div>
      <div className="block md:hidden"><VentasListMobile ventas={data} userFilter={userFilter} /></div>
    </div>
  );
}
