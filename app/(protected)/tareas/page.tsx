import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { ListCheck } from "lucide-react";
import { getTareas } from "./actions";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import TareasListMobile from "./components/tareas-list-mobile";

export default async function TareasPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_tareas")) return <NoAcceso />;
  const data = await getTareas();
  return <div className="container mx-auto py-2"><HeaderComponent Icon={ListCheck} description="En este apartado podrá ver todas las tareas" screenName="Tareas" /><div className="hidden md:block"><DataTable columns={columns} data={data} /></div><div className="block md:hidden"><TareasListMobile tareas={data} /></div></div>;
}
