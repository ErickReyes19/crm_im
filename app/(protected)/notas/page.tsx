import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Button } from "@/components/ui/button";
import { StickyNote } from "lucide-react";
import Link from "next/link";
import { getNotas } from "./actions";

export default async function NotasPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_clientes")) return <NoAcceso />;

  const notas = await getNotas();

  return <div className="container mx-auto py-2 space-y-4">
    <HeaderComponent Icon={StickyNote} description="Notas comerciales por cliente" screenName="Notas" />
    <div><Link href="/notas/create"><Button>Nueva nota</Button></Link></div>
    <div className="space-y-3">
      {notas.map((nota) => <div key={nota.id} className="rounded-lg border p-4">
        <p className="font-medium">{nota.cliente.nombre} {nota.cliente.apellido}</p>
        <p className="text-xs text-muted-foreground">Por: {nota.usuario.usuario} · {nota.createAt.toISOString().slice(0, 10)}</p>
        <p className="mt-2 text-sm">{nota.contenido}</p>
        {nota.evidencia ? <p className="text-xs mt-2 text-emerald-600">Con evidencia en base64</p> : null}
      </div>)}
    </div>
  </div>;
}
