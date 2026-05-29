import { getClientesAsignadosOpciones } from "@/app/(protected)/clientes/actions";
import { getProductosOpciones } from "@/app/(protected)/productos/actions";
import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { Formulario } from "../components/Form";

export default async function CreateVentaPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_venta")) return <NoAcceso />;

  const [clientes, productos] = await Promise.all([getClientesAsignadosOpciones(), getProductosOpciones()]);
  const initialData = { clienteId: clientes[0]?.id ?? "", total: 0, estado: "PROCESO" as const, metodoPago: "EFECTIVO" as const, evidenciaTransferenciaB64: "", productos: [{ productoId: productos[0]?.id ?? "", cantidad: 1, precioUnitario: 0, tipoPrecio: "NORMAL" as const }] };

  return <div className="w-full m-2">
    <HeaderComponent Icon={PlusCircle} screenName="Crear venta" description="En este apartado podrás crear una venta con productos" />
    <Formulario isUpdate={false} initialData={initialData} clientes={clientes} productos={productos} />
  </div>;
}
