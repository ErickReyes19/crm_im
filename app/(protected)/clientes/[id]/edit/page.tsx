import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { getClienteById } from "../../actions";
import { Formulario } from "../../components/Form";

export default async function EditClientePage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_cliente")) return <NoAcceso />;

  const { id } = await params;
  const cliente = await getClienteById(id);
  if (!cliente) redirect("/clientes");

  return (
    <div>
      <HeaderComponent Icon={Pencil} screenName="Editar cliente" description="Actualiza los datos del cliente. La asignación se cambia desde Clientes / Asignaciones." />
      <Formulario isUpdate initialData={cliente} />
    </div>
  );
}
