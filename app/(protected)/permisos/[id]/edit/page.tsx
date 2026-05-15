import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { getPermisoById } from "../../actions";
import { FormularioPermiso } from "../../components/Formulario";

export default async function EditPermisoPage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_permisos")) return <NoAcceso />;

  const { id } = await params;
  const permiso = await getPermisoById(id);
  if (!permiso) {
    redirect("/permisos");
  }

  return (
    <div>
      <HeaderComponent
        Icon={Pencil}
        description="En este apartado podrá editar un permiso."
        screenName="Editar Permiso"
      />
      <FormularioPermiso isUpdate={true} initialData={permiso} />
    </div>
  );
}
