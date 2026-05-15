
import { getPermisos } from "@/app/(protected)/permisos/actions";
import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { getRolPermisoById } from "../../actions";
import { FormularioRol } from "../../components/Formulario";

export default async function Edit({ params }: { params: Promise<{ id: string }> }) {
  // Verificar si hay una sesión activa

  const permisos = await getSessionPermisos();

  if (!permisos?.includes("editar_roles")) {
    return <NoAcceso />;
  }

  // Obtener el cliente por su ID
  const { id } = await params;
  const roles = await getRolPermisoById(id);
  if (!roles) {
    redirect("/roles"); // Redirige si no se encuentra el cliente
  }


  const permisosData = await getPermisos();

  return (
    <div>
      <HeaderComponent
        Icon={Pencil}
        description="En este apartado podrá editar un rol y asignarle permisos"
        screenName="Editar Rol"
      />
      <FormularioRol
        isUpdate={true}
        initialData={roles} // Pasamos los datos del cliente al formulario
        permisos={permisosData}
      />
    </div>
  );
}
