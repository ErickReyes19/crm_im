import { getClientesAsignadosOpciones } from "@/app/(protected)/clientes/actions";
import { getProductosOpciones } from "@/app/(protected)/productos/actions";
import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { getVentaById } from "../../actions";
import { Formulario } from "../../components/Form";

export default async function EditVentaPage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_venta")) return <NoAcceso />;

  const { id } = await params;
  const venta = await getVentaById(id);
  if (!venta) redirect("/ventas");

  const [clientesAsignados, productos] = await Promise.all([getClientesAsignadosOpciones(), getProductosOpciones()]);
  const clienteActualDisponible = clientesAsignados.some((cliente: { id: string }) => cliente.id === venta.clienteId);
  if (!clienteActualDisponible) redirect("/ventas");

  const productosVenta = venta.productos.map((detalle) => ({ productoId: detalle.productoId, cantidad: detalle.cantidad }));

  return <div><HeaderComponent Icon={Pencil} screenName="Editar venta" description="En este apartado podrás editar una venta" /><Formulario isUpdate initialData={{ id: venta.id, clienteId: venta.clienteId, total: Number(venta.total), estado: venta.estado, productos: productosVenta.length > 0 ? productosVenta : [{ productoId: productos[0]?.id ?? "", cantidad: 1 }] }} clientes={clientesAsignados} productos={productos} /></div>;
}
