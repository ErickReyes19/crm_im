import { getSessionPermisos } from "@/auth";
import NoAcceso from "@/components/noAccess";
import HeaderComponent from "@/components/HeaderComponent";
import { Users } from "lucide-react";
import { getClientes } from "./actions";

export default async function ClientesPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_clientes")) return <NoAcceso />;
  const clientes = await getClientes();
  return <div className="container mx-auto py-2"><HeaderComponent Icon={Users} screenName="Clientes" description="Gestión de clientes" /><div className="rounded-md border p-4 text-sm">Total clientes: {clientes.length}</div></div>;
}
