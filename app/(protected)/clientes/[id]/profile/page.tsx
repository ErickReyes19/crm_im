import { getNotasByClienteId } from "@/app/(protected)/notas/actions";
import { getTareasByClienteId } from "@/app/(protected)/tareas/actions";
import { getVentasByClienteId } from "@/app/(protected)/ventas/actions";
import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import DateRangeFilter from "@/components/date-range-filter";
import NoAcceso from "@/components/noAccess";
import { getDateRangePresetInputs, resolveListDateRange } from "@/lib/list-date-range";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, History, ListTodo, MapPin, Phone, PlusCircle, ShoppingCart, StickyNote, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClienteTimeline } from "../../components/cliente-timeline";
import { getClienteById } from "../../actions";
import { buildClienteTimeline } from "../../lib/build-timeline";

type ProfileSearchParams = Promise<{ from?: string; to?: string }>;

export default async function ClienteProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: ProfileSearchParams;
}) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_clientes")) return <NoAcceso />;

  const { id } = await params;
  const query = await searchParams;
  const hasDateFilter = Boolean(query.from || query.to);
  const dateRange = resolveListDateRange(hasDateFilter ? query : getDateRangePresetInputs("30days"));
  const profileHref = `/clientes/${id}/profile`;
  const cliente = await getClienteById(id);
  if (!cliente) redirect("/clientes");

  const [notas, tareas, ventas] = await Promise.all([
    getNotasByClienteId(id),
    getTareasByClienteId(id),
    permisos.includes("ver_ventas") ? getVentasByClienteId(id) : Promise.resolve([]),
  ]);

  const timeline = buildClienteTimeline({
    notas,
    tareas,
    ventas: ventas.map((venta) => ({
      ...venta,
      total: Number(venta.total),
    })),
  }).filter((event) => {
    if (!hasDateFilter) return true;
    return event.date >= dateRange.from && event.date < dateRange.toExclusive;
  });

  const canCreateNota = permisos.includes("crear_notas");
  const canCreateTarea = permisos.includes("crear_tarea");
  const canCreateVenta = permisos.includes("crear_venta");
  const canEditTarea = permisos.includes("editar_tarea");
  const canViewVentas = permisos.includes("ver_ventas");
  const returnTo = `/clientes/${id}/profile`;

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
            <div className="flex flex-wrap items-center gap-2">
              {canCreateNota && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/notas/create?clienteId=${id}&returnTo=${encodeURIComponent(returnTo)}`}>
                    <StickyNote className="mr-2 h-4 w-4" />
                    Crear nota
                  </Link>
                </Button>
              )}
              {canCreateTarea && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/tareas/create?clienteId=${id}&returnTo=${encodeURIComponent(returnTo)}`}>
                    <ListTodo className="mr-2 h-4 w-4" />
                    Crear tarea
                  </Link>
                </Button>
              )}
              {canCreateVenta && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/ventas/create?clienteId=${id}&returnTo=${encodeURIComponent(returnTo)}`}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Crear venta
                  </Link>
                </Button>
              )}
              <Badge variant="secondary" className="text-xs">{cliente.etiqueta}</Badge>
            </div>
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

      <section className="space-y-4">
        <DateRangeFilter
          from={dateRange.fromInput}
          to={dateRange.toInput}
          baseHref={profileHref}
          showAllHref={profileHref}
          showAllLabel="Todo el historial"
          showAllActive={!hasDateFilter}
          title="Filtro de seguimiento"
          description={hasDateFilter
            ? "Mostrando actividad del cliente en el rango seleccionado. Usa los accesos rápidos o define fechas personalizadas."
            : "Mostrando todo el historial del cliente. Usa los accesos rápidos o define un rango de fechas para filtrar el seguimiento."}
          alwaysApplyPresetParams
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <History className="h-4 w-4" />
              Línea de tiempo del seguimiento
            </div>
            <p className="text-sm text-muted-foreground">
              {hasDateFilter
                ? `Notas, tareas y ventas del ${dateRange.fromInput} al ${dateRange.toInput}.`
                : "Notas, tareas y ventas ordenadas cronológicamente para ver la evolución del cliente."}
            </p>
          </div>
          {timeline.length === 0 && (canCreateNota || canCreateTarea || canCreateVenta) && (
            <div className="flex flex-wrap gap-2">
              {canCreateNota && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/notas/create?clienteId=${id}&returnTo=${encodeURIComponent(returnTo)}`}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear nota
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>

        <ClienteTimeline
          events={timeline}
          returnTo={returnTo}
          canEditTarea={canEditTarea}
          canViewVentas={canViewVentas}
          emptyMessage={hasDateFilter
            ? "No hay actividad registrada para este cliente en el rango de fechas seleccionado."
            : undefined}
        />
      </section>
    </div>
  );
}
