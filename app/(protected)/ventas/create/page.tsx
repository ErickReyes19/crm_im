import { getClientesOpciones } from "@/app/(protected)/clientes/actions";
import { getUsuariosOpciones } from "@/app/(protected)/usuarios/actions";
import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { Formulario } from "../components/Form";

export default async function CreateVentaPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_venta")) return <NoAcceso />;
  const clientes = await getClientesOpciones(); const usuarios = await getUsuariosOpciones();
  const initialData = { clienteId: clientes[0]?.id ?? "", usuarioId: usuarios[0]?.id ?? "", total: 0, estado: "PROCESO" as const };

  return <div className="w-full m-2">
    <HeaderComponent Icon={PlusCircle} screenName="Crear venta" description="En este apartado podrás crear una venta" />
    <Formulario isUpdate={false} initialData={initialData} clientes={clientes} usuarios={usuarios} />
  </div>;
}
