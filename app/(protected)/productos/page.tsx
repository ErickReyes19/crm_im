import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Package } from "lucide-react";
import { getProductos } from "./actions";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import ProductosListMobile from "./components/productos-list-mobile";

export default async function ProductosPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_productos")) return <NoAcceso />;

  const data = (await getProductos()).map((producto) => ({ ...producto, precio: Number(producto.precio) }));

  return (
    <div className="container mx-auto py-2">
      <HeaderComponent Icon={Package} description="En este apartado podrá administrar los productos disponibles para ventas y tareas" screenName="Productos" />
      <div className="hidden md:block"><DataTable columns={columns} data={data} /></div>
      <div className="block md:hidden"><ProductosListMobile productos={data} /></div>
    </div>
  );
}
