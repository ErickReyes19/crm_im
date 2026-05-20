import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { getTareas } from "./actions";

function getAlertColor(fechaObjetivo: Date) {
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  const objetivo = new Date(fechaObjetivo.getFullYear(), fechaObjetivo.getMonth(), fechaObjetivo.getDate()).getTime();
  if (objetivo < inicioHoy) return "text-red-600";
  if (objetivo === inicioHoy) return "text-yellow-600";
  return "text-green-600";
}

export default async function TareasPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_tareas")) return <NoAcceso />;
  const tareas = await getTareas();

  return <div className="container mx-auto py-2 space-y-4"><HeaderComponent Icon={ClipboardList} description="Tareas de seguimiento por fecha" screenName="Tareas" />
    <div><Link href="/tareas/create"><Button>Nueva tarea</Button></Link></div>
    <div className="space-y-3">{tareas.map((t) => <div key={t.id} className="rounded-lg border p-4"><p className="font-semibold">{t.titulo}</p><p className="text-sm text-muted-foreground">Cliente: {t.nota.cliente.nombre} {t.nota.cliente.apellido}</p><p className="text-sm">{t.descripcion}</p><p className={`text-sm font-medium ${getAlertColor(t.fechaObjetivo)}`}>Fecha objetivo: {t.fechaObjetivo.toISOString().slice(0,10)}</p><Link href={`/tareas/${t.id}/edit`}><Button size="sm" variant="ghost">Editar</Button></Link></div>)}</div>
  </div>;
}
