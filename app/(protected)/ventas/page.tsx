import { getSessionPermisos } from "@/auth";
import NoAcceso from "@/components/noAccess";
import HeaderComponent from "@/components/HeaderComponent";
import { HandCoins } from "lucide-react";
import { getVentas } from "./actions";

export default async function VentasPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_ventas")) return <NoAcceso />;
  const ventas = await getVentas();
  return <div className="container mx-auto py-2"><HeaderComponent Icon={HandCoins} screenName="Ventas" description="Gestión de ventas" /><div className="rounded-md border p-4 text-sm">Total ventas: {ventas.length}</div></div>;
}
