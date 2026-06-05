import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatHondurasDateTime } from "@/lib/date-format";
import { DollarSign, ListChecks, ShoppingCart, Truck, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getVentaById } from "../actions";

function getEstadoLabel(estado: string) {
  switch (estado) {
    case "PROCESO":
      return "En proceso";
    case "ENVIO":
      return "En envío";
    case "ENTREGADA":
      return "Entregada";
    default:
      return estado;
  }
}

export default async function VentaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_ventas")) return <NoAcceso />;

  const { id } = await params;
  const venta = await getVentaById(id);
  if (!venta) redirect("/ventas");

  return (
    <div className="container mx-auto space-y-4 py-2">
      <HeaderComponent Icon={ShoppingCart} description="Consulta todo el detalle de esta venta" screenName="Detalle de venta" />

      <section className="rounded-2xl border bg-card p-4 shadow-sm md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Cliente</p>
            <h2 className="text-2xl font-semibold">{venta.cliente?.nombre} {venta.cliente?.apellido}</h2>
          </div>
          <Badge variant="secondary">{getEstadoLabel(venta.estado)}</Badge>
        </div>

        <div className="mb-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <p className="flex items-center gap-2"><UserRound className="h-4 w-4" />Vendedor: <span className="font-medium text-foreground">{venta.usuario?.nombre ? `${venta.usuario.nombre} (${venta.usuario.usuario})` : venta.usuario?.usuario ?? "Usuario"}</span></p>
          <p className="flex items-center gap-2"><ListChecks className="h-4 w-4" />Fecha: <span className="font-medium text-foreground">{formatHondurasDateTime(venta.createAt)}</span></p>
          <p className="flex items-center gap-2"><Truck className="h-4 w-4" />Método de pago: <span className="font-medium text-foreground">{venta.metodoPago === "TRANSFERENCIA" ? "Transferencia" : "Efectivo"}</span></p>
          <p className="flex items-center gap-2"><DollarSign className="h-4 w-4" />Total: <span className="font-medium text-foreground">{Number(venta.total).toLocaleString("es-DO", { style: "currency", currency: "HNL" })}</span></p>
        </div>


        {venta.metodoPago === "TRANSFERENCIA" && (
          <div className="mb-4 rounded-2xl border bg-background p-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Evidencia de transferencia</p>
            {venta.evidenciaTransferenciaUbicacion ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/media/${venta.evidenciaTransferenciaUbicacion}`} alt="Evidencia de transferencia" className="max-h-[520px] w-full rounded-xl border object-contain" />
            ) : (
              <p className="text-sm text-muted-foreground">Esta venta por transferencia no tiene imagen de evidencia registrada.</p>
            )}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border bg-background">
          <div className="bg-muted px-4 py-3 text-sm font-medium text-muted-foreground">Productos</div>
          <div className="divide-y border-t">
            {venta.productos.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No hay productos registrados para esta venta.</div>
            ) : (
              venta.productos.map((detalle) => (
                <div key={`${detalle.productoId}-${detalle.cantidad}`} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{detalle.producto ? `${detalle.producto.nombre} - ${detalle.producto.descripcion}` : "Producto"}</p>
                    <p className="text-sm text-muted-foreground">Cantidad: {detalle.cantidad}</p>
                  </div>
                  <div className="grid gap-1 text-sm text-muted-foreground sm:text-right">
                    <p>Precio unitario: <span className="text-foreground">{Number(detalle.precioUnitario).toLocaleString("es-DO", { style: "currency", currency: "HNL" })}</span></p>
                    <p>Subtotal: <span className="text-foreground">{Number(detalle.subtotal).toLocaleString("es-DO", { style: "currency", currency: "HNL" })}</span></p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link href="/ventas">Volver</Link></Button>
          {permisos.includes("editar_venta") && (
            <Button asChild><Link href={`/ventas/${venta.id}/edit`}>Editar venta</Link></Button>
          )}
        </div>
      </section>
    </div>
  );
}
