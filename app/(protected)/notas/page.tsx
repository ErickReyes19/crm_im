import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { StickyNote } from "lucide-react";
import { getNotas } from "./actions";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

export default async function NotasPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_notas")) return <NoAcceso />;
  const notas = await getNotas();

  return <div className="container mx-auto py-2 space-y-4"><HeaderComponent Icon={StickyNote} description="Notas comerciales por cliente" screenName="Notas" /><DataTable columns={columns} data={notas} /></div>;
}
