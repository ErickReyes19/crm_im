import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";

export default async function CreateClientePage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_cliente")) return <NoAcceso />;

  return (
    <div>
      <HeaderComponent Icon={PlusCircle} screenName="Crear cliente" description="Formulario para crear clientes (pendiente UI detallada)." />
    </div>
  );
}
