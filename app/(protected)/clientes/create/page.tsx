import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { Formulario } from "../components/Form";

export default async function CreateClientePage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_cliente")) return <NoAcceso />;

  const initialData = {
    nombre: "",
    apellido: "",
    ciudad: "",
    correo: "",
    numero: "",
    direccion: "",
    etiqueta: "NUEVO" as const,
    activo: true,
  };

  return (
    <div>
      <HeaderComponent Icon={PlusCircle} screenName="Crear cliente" description="Registra un cliente. La asignación inicial será tu usuario automáticamente." />
      <Formulario isUpdate={false} initialData={initialData} />
    </div>
  );
}
