import { getNotas } from "@/app/(protected)/notas/actions";
import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, FileText, MapPin, Phone, StickyNote, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getClienteById } from "../../actions";

export default async function ClienteProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_clientes")) return <NoAcceso />;

  const { id } = await params;
  const cliente = await getClienteById(id);
  if (!cliente) redirect("/clientes");

  const notas = (await getNotas()).filter((n) => n.clienteId === id);

  return (
    <div className="container mx-auto space-y-5 py-2">
      <HeaderComponent Icon={UserRound} description="Detalle completo del cliente" screenName="Perfil cliente" />

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-muted/40 p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Cliente</p>
              <h2 className="text-2xl font-semibold">{cliente.nombre} {cliente.apellido}</h2>
            </div>
            <Badge variant="secondary" className="text-xs">{cliente.etiqueta}</Badge>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-3 md:p-6">
          <div className="rounded-xl border bg-background p-4">
            <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground"><MapPin className="h-4 w-4" />Ciudad</p>
            <p className="font-medium">{cliente.ciudad}</p>
          </div>
          <div className="rounded-xl border bg-background p-4">
            <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground"><Phone className="h-4 w-4" />Teléfono</p>
            <p className="font-medium">{cliente.numero}</p>
          </div>
          <div className="rounded-xl border bg-background p-4">
            <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground"><Building2 className="h-4 w-4" />Estado</p>
            <p className="font-medium">{cliente.activo ? "Activo" : "Inactivo"}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium"><StickyNote className="h-4 w-4" />Notas del cliente</div>
        {notas.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Este cliente aún no tiene notas registradas.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {notas.map((nota) => (
              <article key={nota.id} className="rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Nota</p>
                    <p className="line-clamp-2 text-sm">{nota.contenido}</p>
                  </div>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mb-4 text-xs text-muted-foreground">{nota.createAt.toISOString().slice(0, 10)} · {nota.evidencias.length} evidencias</p>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/notas/${nota.id}/edit`}>Ver nota</Link>
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
