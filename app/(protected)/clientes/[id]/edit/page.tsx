import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { getClienteById } from "../../actions";

export default async function EditClientePage({ params }: { params: { id: string } }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_cliente")) return <NoAcceso />;

  const cliente = await getClienteById(params.id);
  if (!cliente) redirect("/clientes");

  return <HeaderComponent Icon={Pencil} screenName="Editar cliente" description={`Editando: ${cliente.nombre} ${cliente.apellido}`} />;
}
