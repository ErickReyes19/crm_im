import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatHondurasDate, formatHondurasDateTime } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock3, ListTodo, ShoppingCart, StickyNote } from "lucide-react";
import Link from "next/link";
import type { ClienteTimelineEvent } from "../lib/build-timeline";

const ESTADO_TAREA_LABELS: Record<"PENDIENTE" | "EN_PROGRESO" | "COMPLETADA", string> = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completada",
};

const ESTADO_VENTA_LABELS: Record<"PROCESO" | "ENVIO" | "ENTREGADA", string> = {
  PROCESO: "En proceso",
  ENVIO: "En envío",
  ENTREGADA: "Entregada",
};

function getUsuarioLabel(usuario: { usuario: string; nombre: string | null }) {
  return usuario.nombre ?? usuario.usuario;
}

function getFechaAlerta(fechaObjetivo: Date) {
  const hoy = new Date();
  const iniHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  const objetivo = new Date(new Date(fechaObjetivo).getFullYear(), new Date(fechaObjetivo).getMonth(), new Date(fechaObjetivo).getDate()).getTime();
  if (objetivo < iniHoy) return { text: "Vencida", className: "text-red-600", Icon: AlertTriangle };
  if (objetivo === iniHoy) return { text: "Hoy", className: "text-yellow-600", Icon: Clock3 };
  return { text: "Próxima", className: "text-green-600", Icon: CheckCircle2 };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL" }).format(value);
}

const EVENT_STYLES = {
  nota: {
    label: "Nota",
    Icon: StickyNote,
    dot: "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    badge: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
  },
  tarea: {
    label: "Tarea",
    Icon: ListTodo,
    dot: "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    badge: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-200",
  },
  venta: {
    label: "Venta",
    Icon: ShoppingCart,
    dot: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  },
} as const;

function TimelineEventCard({
  event,
  returnTo,
  canEditTarea,
  canViewVentas,
}: {
  event: ClienteTimelineEvent;
  returnTo: string;
  canEditTarea: boolean;
  canViewVentas: boolean;
}) {
  const style = EVENT_STYLES[event.type];

  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-3 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", style.badge)}>{style.label}</Badge>
          <time className="text-xs text-muted-foreground">{formatHondurasDateTime(event.date)}</time>
        </div>
        {event.type === "nota" && (
          <p className="text-sm leading-relaxed">{event.data.contenido}</p>
        )}
        {event.type === "tarea" && (
          <>
            <p className="font-medium">{event.data.titulo}</p>
            {event.data.descripcion && <p className="text-sm text-muted-foreground">{event.data.descripcion}</p>}
          </>
        )}
        {event.type === "venta" && (
          <>
            <p className="font-medium">{formatCurrency(event.data.total)}</p>
            <p className="text-sm text-muted-foreground">
              {event.data.productos.length} producto{event.data.productos.length === 1 ? "" : "s"} · {ESTADO_VENTA_LABELS[event.data.estado]}
            </p>
          </>
        )}
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <p>Registrado por {getUsuarioLabel(event.data.usuario)}</p>

        {event.type === "nota" && event.data.evidencias.length > 0 && (
          <p>{event.data.evidencias.length} evidencia{event.data.evidencias.length === 1 ? "" : "s"}</p>
        )}

        {event.type === "tarea" && (() => {
          const alerta = getFechaAlerta(event.data.fechaObjetivo);
          const AlertIcon = alerta.Icon;
          return (
            <>
              <p className={cn("inline-flex items-center gap-1 font-medium", alerta.className)}>
                <AlertIcon className="h-3.5 w-3.5" />
                Objetivo: {formatHondurasDate(event.data.fechaObjetivo)} · {alerta.text}
              </p>
              <p className="line-clamp-1">Vinculada a nota: {event.data.nota.contenido}</p>
              <Badge variant="outline" className="text-xs">{ESTADO_TAREA_LABELS[event.data.estado]}</Badge>
            </>
          );
        })()}

        {event.type === "venta" && (
          <>
            <p>{event.data.tipoDocumento === "FACTURA" ? "Factura" : "Recibo"} · {event.data.metodoPago === "TRANSFERENCIA" ? "Transferencia" : "Efectivo"}</p>
            {event.data.productos.length > 0 && (
              <p className="line-clamp-2">
                {event.data.productos.map((item) => `${item.cantidad}x ${item.producto.nombre}`).join(" · ")}
              </p>
            )}
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {event.type === "nota" && (
          <Button asChild size="sm" variant="outline">
            <Link href={`/notas/${event.data.id}`}>Ver nota</Link>
          </Button>
        )}
        {event.type === "tarea" && canEditTarea && (
          <Button asChild size="sm" variant="outline">
            <Link href={`/tareas/${event.data.id}/edit?returnTo=${encodeURIComponent(returnTo)}`}>Editar tarea</Link>
          </Button>
        )}
        {event.type === "venta" && canViewVentas && (
          <Button asChild size="sm" variant="outline">
            <Link href={`/ventas/${event.data.id}`}>Ver venta</Link>
          </Button>
        )}
      </div>
    </article>
  );
}

export function ClienteTimeline({
  events,
  returnTo,
  canEditTarea,
  canViewVentas,
  emptyMessage = "Aún no hay actividad registrada para este cliente. Las notas, tareas y ventas aparecerán aquí en orden cronológico.",
}: {
  events: ClienteTimelineEvent[];
  returnTo: string;
  canEditTarea: boolean;
  canViewVentas: boolean;
  emptyMessage?: string;
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const counts = {
    nota: events.filter((event) => event.type === "nota").length,
    tarea: events.filter((event) => event.type === "tarea").length,
    venta: events.filter((event) => event.type === "venta").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {counts.nota > 0 && <Badge variant="secondary">{counts.nota} nota{counts.nota === 1 ? "" : "s"}</Badge>}
        {counts.tarea > 0 && <Badge variant="secondary">{counts.tarea} tarea{counts.tarea === 1 ? "" : "s"}</Badge>}
        {counts.venta > 0 && <Badge variant="secondary">{counts.venta} venta{counts.venta === 1 ? "" : "s"}</Badge>}
        <Badge variant="outline">{events.length} evento{events.length === 1 ? "" : "s"} en total</Badge>
      </div>

      <ol className="relative ml-4 border-l-2 border-muted pl-8">
        {events.map((event, index) => {
          const style = EVENT_STYLES[event.type];
          const Icon = style.Icon;

          return (
            <li key={`${event.type}-${event.type === "nota" ? event.data.id : event.type === "tarea" ? event.data.id : event.data.id}`} className={cn("relative", index < events.length - 1 ? "pb-8" : "pb-0")}>
              <span
                className={cn(
                  "absolute -left-12.5 top-1 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-background shadow-sm",
                  style.dot,
                )}
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>
              <TimelineEventCard
                event={event}
                returnTo={returnTo}
                canEditTarea={canEditTarea}
                canViewVentas={canViewVentas}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
