import { getUsuariosOpciones } from "@/app/(protected)/usuarios/actions";
import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { UserRoundCheck } from "lucide-react";
import { getClientes } from "../actions";
import { AsignacionesForm } from "../components/AsignacionesForm";

export default async function AsignacionesClientesPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("asignar_clientes")) return <NoAcceso />;

  const [usuarios, clientes] = await Promise.all([getUsuariosOpciones(), getClientes()]);

  return (
    <div className="container mx-auto py-2">
      <HeaderComponent Icon={UserRoundCheck} screenName="Asignaciones de clientes" description="Selecciona o deselecciona los clientes responsables por usuario." />
      <AsignacionesForm usuarios={usuarios} clientes={clientes} />
    </div>
  );
}
