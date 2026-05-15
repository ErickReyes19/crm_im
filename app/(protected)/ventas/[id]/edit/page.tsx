import { getClientesOpciones } from "@/app/(protected)/clientes/actions";
import { getUsuariosOpciones } from "@/app/(protected)/usuarios/actions";
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
  const venta = await getVentaById(id); if (!venta) redirect('/ventas');
  const clientes = await getClientesOpciones(); const usuarios = await getUsuariosOpciones();
  return <div><HeaderComponent Icon={Pencil} screenName="Editar venta" description="En este apartado podrás editar una venta" /><Formulario isUpdate initialData={{...venta, total:Number(venta.total)}} clientes={clientes} usuarios={usuarios} /></div>;
}
