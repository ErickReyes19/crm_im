/* eslint-disable @next/next/no-img-element */
import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatHondurasDateTime } from "@/lib/date-format";
import { CalendarDays, FileImage, Pencil, StickyNote, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getNotaById } from "../actions";

export default async function NotaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_notas")) return <NoAcceso />;

  const { id } = await params;
  const nota = await getNotaById(id);
  if (!nota) redirect("/notas");

  return (
    <div className="container mx-auto space-y-4 py-2">
      <HeaderComponent Icon={StickyNote} description="Consulta el detalle completo de la nota" screenName="Detalle de nota" />

      <section className="rounded-2xl border bg-card p-4 shadow-sm md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Cliente</p>
            <h2 className="text-xl font-semibold">{nota.cliente?.nombre} {nota.cliente?.apellido}</h2>
          </div>
          <Badge variant="secondary">{nota.evidencias.length} evidencias</Badge>
        </div>

        <div className="mb-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <p className="flex items-center gap-2"><UserRound className="h-4 w-4" />Registrada por: <span className="font-medium text-foreground">{nota.usuario?.usuario ?? "Usuario"}</span></p>
          <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Fecha: <span className="font-medium text-foreground">{formatHondurasDateTime(nota.createAt)}</span></p>
        </div>

        <div className="rounded-xl border bg-background p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Contenido</p>
          <p className="whitespace-pre-wrap text-sm">{nota.contenido}</p>
        </div>

        <div className="mt-5 flex gap-2">
          <Button asChild variant="outline"><Link href="/notas">Volver</Link></Button>
          {permisos.includes("editar_nota") && <Button asChild><Link href={`/notas/${nota.id}/edit`}><Pencil className="mr-2 h-4 w-4" />Editar nota</Link></Button>}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-4 shadow-sm md:p-6">
        <h3 className="mb-3 flex items-center gap-2 font-medium"><FileImage className="h-4 w-4" />Imágenes de evidencia</h3>
        {nota.evidencias.length === 0 ? (
          <p className="text-sm text-muted-foreground">Esta nota no tiene imágenes de evidencia.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nota.evidencias.map((evidencia, index) => (
              <a key={evidencia.id} href={`/api/media/${evidencia.ubicacion}`} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-xl border">
                <img src={`/api/media/${evidencia.ubicacion}`} alt={evidencia.nombre || `Evidencia ${index + 1}`} className="h-48 w-full object-cover transition group-hover:scale-[1.02]" />
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
