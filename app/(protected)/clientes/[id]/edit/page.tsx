import { getUsuariosOpciones } from "@/app/(protected)/usuarios/actions";
import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { getClienteById } from "../../actions";
import { Formulario } from "../../components/Form";

export default async function EditClientePage({ params }: { params: { id: string } }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_cliente")) return <NoAcceso />;
  const cliente = await getClienteById(params.id); if (!cliente) redirect('/clientes');
  const usuarios = await getUsuariosOpciones();
  return <div><HeaderComponent Icon={Pencil} screenName="Editar cliente" description="En este apartado podrás editar un cliente" /><Formulario isUpdate initialData={cliente} usuarios={usuarios} /></div>;
}
