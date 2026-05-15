import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { getVentaById } from "../../actions";

export default async function EditVentaPage({ params }: { params: { id: string } }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_venta")) return <NoAcceso />;

  const venta = await getVentaById(params.id);
  if (!venta) redirect("/ventas");

  return <HeaderComponent Icon={Pencil} screenName="Editar venta" description={`Editando venta: ${venta.id}`} />;
}
