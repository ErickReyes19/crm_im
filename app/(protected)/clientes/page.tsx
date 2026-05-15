import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { ListCheck } from "lucide-react";
import { getClientes } from "./actions";
import ClientesListMobile from "./components/clientes-list-mobile";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

export default async function ClientesPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_clientes")) return <NoAcceso />;
  const data = await getClientes();
  return <div className="container mx-auto py-2"><HeaderComponent Icon={ListCheck} description="En este apartado podrá ver todos los clientes" screenName="Clientes" /><div className="hidden md:block"><DataTable columns={columns} data={data} /></div><div className="block md:hidden"><ClientesListMobile clientes={data} /></div></div>;
}
