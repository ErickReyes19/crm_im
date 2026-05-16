import { getClientesAsignadosOpciones } from "@/app/(protected)/clientes/actions";
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

  const clientesAsignados = await getClientesAsignadosOpciones();
  const clienteActualDisponible = clientesAsignados.some((cliente: { id: string }) => cliente.id === venta.clienteId);
  if (!clienteActualDisponible) redirect("/ventas");

  return <div><HeaderComponent Icon={Pencil} screenName="Editar venta" description="En este apartado podrás editar una venta" /><Formulario isUpdate initialData={{ id: venta.id, clienteId: venta.clienteId, total: Number(venta.total), estado: venta.estado }} clientes={clientesAsignados} /></div>;
}
