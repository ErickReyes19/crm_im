import { getClientesOpciones } from "@/app/(protected)/clientes/actions";
import { getProductosOpciones } from "@/app/(protected)/productos/actions";
import { getUsuariosOpciones } from "@/app/(protected)/usuarios/actions";
import { getSession, getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { Formulario } from "../components/Form";

export default async function CreateVentaPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_venta")) return <NoAcceso />;

  const session = await getSession();
  const [usuarios, clientes, productos] = await Promise.all([getUsuariosOpciones(), getClientesOpciones(), getProductosOpciones()]);
  const initialData = { clienteId: "", total: 0, isv: 0, tipoDocumento: "RECIBO" as const, conEnvio: false, envio: 0, estado: "PROCESO" as const, metodoPago: "EFECTIVO" as const, evidenciaTransferenciaUbicacion: "", evidenciaTransferenciaNombre: "", productos: [{ productoId: productos[0]?.id ?? "", cantidad: 1, precioUnitario: 0, tipoPrecio: "NORMAL" as const }] };

  return <div className="w-full m-2">
    <HeaderComponent Icon={PlusCircle} screenName="Crear venta" description="En este apartado podrás crear una venta con productos" />
    <Formulario isUpdate={false} initialData={initialData} usuarios={usuarios} clientes={clientes} currentUserId={session?.IdUser ?? ""} productos={productos} />
  </div>;
}
