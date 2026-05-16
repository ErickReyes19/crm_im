import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BarChart3, CalendarDays, HandCoins, Package, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";
import { getCurrentMonthRange, getCurrentWeekRange, getDashboardMetrics } from "./actions";

type DashboardSearchParams = Promise<{ from?: string; to?: string }>;

const currencyFormatter = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" });
const numberFormatter = new Intl.NumberFormat("es-DO");

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function rangeHref(range: { from: string; to: string }) {
  return `/dashboard?from=${range.from}&to=${range.to}`;
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-3xl border border-dashed p-4 text-sm text-muted-foreground">{text}</p>;
}

export default async function DashboardPage({ searchParams }: { searchParams: DashboardSearchParams }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_dashboard") && !permisos?.includes("ver_ventas")) return <NoAcceso />;

  const params = await searchParams;
  const [metrics, currentMonth, currentWeek] = await Promise.all([
    getDashboardMetrics({ from: params.from, to: params.to }),
    Promise.resolve(getCurrentMonthRange()),
    Promise.resolve(getCurrentWeekRange()),
  ]);

  const kpis = [
    { title: "Ventas totales", value: formatCurrency(metrics.kpis.ventasTotales), description: metrics.scopeLabel, icon: HandCoins },
    { title: "Total de clientes", value: formatNumber(metrics.kpis.totalClientes), description: "Clientes visibles para tu usuario", icon: Users },
    { title: "Total de ventas", value: formatNumber(metrics.kpis.totalVentas), description: "Ventas dentro del rango", icon: ShoppingCart },
    { title: "Total de productos", value: formatNumber(metrics.kpis.totalProductos), description: "Productos activos", icon: Package },
  ];

  return (
    <div className="container mx-auto space-y-6 py-2">
      <HeaderComponent Icon={BarChart3} description="Indicadores principales de ventas, clientes y productos por rango de fecha" screenName="Dashboard" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" />Filtros de fecha</CardTitle>
          <CardDescription>Rango aplicado: {metrics.range.label}. Alcance: {metrics.scopeLabel.toLowerCase()}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto] md:items-end">
            <label className="space-y-2 text-sm font-medium">
              Desde
              <Input name="from" type="date" defaultValue={metrics.range.from} />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Hasta
              <Input name="to" type="date" defaultValue={metrics.range.to} />
            </label>
            <Button type="submit">Aplicar rango</Button>
            <Button asChild variant="outline"><Link href={rangeHref(currentWeek)}>Esta semana</Link></Button>
            <Button asChild variant="outline"><Link href={rangeHref(currentMonth)}>Mes actual</Link></Button>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <div>
                <CardDescription>{kpi.title}</CardDescription>
                <CardTitle className="text-2xl font-semibold">{kpi.value}</CardTitle>
              </div>
              <kpi.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{kpi.description}</p></CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 productos más vendidos</CardTitle>
            <CardDescription>Ordenados por unidades vendidas en el rango.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.productosMasVendidos.length === 0 ? <EmptyState text="No hay productos vendidos en este rango." /> : metrics.productosMasVendidos.map((producto, index) => (
              <div key={producto.id} className="flex items-center justify-between rounded-3xl border p-3">
                <div><p className="font-medium">{index + 1}. {producto.nombre}</p><p className="text-sm text-muted-foreground">{formatNumber(producto.cantidad)} unidades</p></div>
                <span className="font-semibold">{formatCurrency(producto.total)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 productos menos vendidos</CardTitle>
            <CardDescription>Incluye productos activos sin ventas en el rango.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.productosMenosVendidos.length === 0 ? <EmptyState text="No hay productos activos para analizar." /> : metrics.productosMenosVendidos.map((producto, index) => (
              <div key={producto.id} className="flex items-center justify-between rounded-3xl border p-3">
                <div><p className="font-medium">{index + 1}. {producto.nombre}</p><p className="text-sm text-muted-foreground">{formatNumber(producto.cantidad)} unidades</p></div>
                <span className="font-semibold">{formatCurrency(producto.total)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top clientes con más ventas</CardTitle>
            <CardDescription>Clientes con mayor facturación en el rango.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.topClientesConMasVentas.length === 0 ? <EmptyState text="No hay clientes con ventas en este rango." /> : metrics.topClientesConMasVentas.map((cliente, index) => (
              <div key={cliente.id} className="flex items-center justify-between rounded-3xl border p-3">
                <div><p className="font-medium">{index + 1}. {cliente.nombre}</p><p className="text-sm text-muted-foreground">{formatNumber(cliente.cantidadVentas)} ventas</p></div>
                <span className="font-semibold">{formatCurrency(cliente.total)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 clientes sin ventas</CardTitle>
            <CardDescription>Clientes visibles sin ventas dentro del rango seleccionado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.topClientesSinVentas.length === 0 ? <EmptyState text="Todos los clientes visibles tienen ventas en este rango." /> : metrics.topClientesSinVentas.map((cliente, index) => (
              <div key={cliente.id} className="rounded-3xl border p-3">
                <p className="font-medium">{index + 1}. {cliente.nombre}</p>
                <p className="text-sm text-muted-foreground">Última venta: {cliente.ultimaVenta ?? "Sin historial"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
