import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { getClienteById } from "../../actions";
import { getNotas } from "@/app/(protected)/notas/actions";

export default async function ClienteProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_clientes")) return <NoAcceso />;
  const { id } = await params;
  const cliente = await getClienteById(id);
  if (!cliente) redirect("/clientes");
  const notas = (await getNotas()).filter((n) => n.clienteId === id);

  return <div className="container mx-auto py-2 space-y-4"><HeaderComponent Icon={UserRound} description="Detalle completo del cliente" screenName="Perfil cliente" />
    <div className="rounded-lg border p-4"><p><b>Nombre:</b> {cliente.nombre} {cliente.apellido}</p><p><b>Ciudad:</b> {cliente.ciudad}</p><p><b>Teléfono:</b> {cliente.numero}</p><p><b>Etiqueta:</b> {cliente.etiqueta}</p></div>
    <div className="space-y-3">{notas.map((nota) => <div key={nota.id} className="rounded-lg border p-4"><p className="text-sm">{nota.contenido}</p><p className="text-xs text-muted-foreground">{nota.createAt.toISOString().slice(0,10)} · {nota.evidencias.length} evidencias</p></div>)}</div>
  </div>;
}
