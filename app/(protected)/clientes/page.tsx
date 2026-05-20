import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Button } from "@/components/ui/button";
import { ListCheck, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { getClientes } from "./actions";
import ClientesListMobile from "./components/clientes-list-mobile";
import ClientesTable from "./components/clientes-table";

export default async function ClientesPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_clientes")) return <NoAcceso />;

  const data = await getClientes();

  return (
    <div className="container mx-auto py-2">
      <HeaderComponent Icon={ListCheck} description="En este apartado podrá ver todos los clientes" screenName="Clientes" />
      {permisos.includes("asignar_clientes") && (
        <div className="mb-4 flex justify-end">
          <Button asChild variant="outline">
            <Link href="/clientes/asignaciones"><UserRoundCheck className="mr-2 h-4 w-4" />Asignaciones</Link>
          </Button>
        </div>
      )}
      <div className="hidden md:block"><ClientesTable data={data} canEdit={permisos.includes("editar_cliente")} canViewAllClients={permisos.includes("ver_todos_clientes")} /></div>
      <div className="block md:hidden"><ClientesListMobile clientes={data} canEdit={permisos.includes("editar_cliente")} /></div>
    </div>
  );
}
