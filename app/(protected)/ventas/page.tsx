import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { ListCheck } from "lucide-react";
import { getVentas } from "./actions";
import VentasListMobile from "./components/ventas-list-mobile";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

export default async function VentasPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_ventas")) return <NoAcceso />;

  const data = (await getVentas()).map((venta: Awaited<ReturnType<typeof getVentas>>[number]) => ({ ...venta, total: Number(venta.total), productos: venta.productos.map((detalle) => ({ ...detalle, precioUnitario: Number(detalle.precioUnitario), subtotal: Number(detalle.subtotal), producto: detalle.producto ? { ...detalle.producto, precio: Number(detalle.producto.precio) } : detalle.producto })) }));

  return (
    <div className="container mx-auto py-2">
      <HeaderComponent Icon={ListCheck} description="En este apartado podrá ver todas las ventas" screenName="Ventas" />
      <div className="hidden md:block"><DataTable columns={columns} data={data} /></div>
      <div className="block md:hidden"><VentasListMobile ventas={data} /></div>
    </div>
  );
}
