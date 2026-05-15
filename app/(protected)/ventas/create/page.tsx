import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";

export default async function CreateVentaPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_venta")) return <NoAcceso />;

  return <HeaderComponent Icon={PlusCircle} screenName="Crear venta" description="Formulario para crear ventas (pendiente UI detallada)." />;
}
