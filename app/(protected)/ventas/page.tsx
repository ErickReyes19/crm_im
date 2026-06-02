import { getSession } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { getUserDisplayName, isSuperAdminSession } from "@/lib/access-scope";
import { ListCheck } from "lucide-react";
import { getVentas } from "./actions";
import VentasListMobile from "./components/ventas-list-mobile";
import { DataTable } from "./components/data-table";
import { columns, VentaTableRow } from "./components/columns";

export default async function VentasPage() {
  const session = await getSession();
  const permisos = session?.Permiso;
  if (!permisos?.includes("ver_ventas")) return <NoAcceso />;

  const puedeEditar = permisos.includes("editar_venta");
  const showUserFilter = isSuperAdminSession(session!) || permisos.includes("gestionar_mi_equipo");
  const data: VentaTableRow[] = (await getVentas()).map((venta: Awaited<ReturnType<typeof getVentas>>[number]) => ({ ...venta, canEditEstado: puedeEditar, total: Number(venta.total), usuarioFiltro: getUserDisplayName(venta.usuario), productos: venta.productos.map((detalle) => ({ ...detalle, precioUnitario: Number(detalle.precioUnitario), subtotal: Number(detalle.subtotal) })) }));
  const userFilter = { enabled: showUserFilter, placeholder: "Ver ventas por vendedor" };

  return (
    <div className="container mx-auto py-2">
      <HeaderComponent Icon={ListCheck} description="En este apartado podrá ver todas las ventas" screenName="Ventas" />
      <div className="hidden md:block"><DataTable columns={columns} data={data} userFilter={userFilter} /></div>
      <div className="block md:hidden"><VentasListMobile ventas={data} userFilter={userFilter} /></div>
    </div>
  );
}
