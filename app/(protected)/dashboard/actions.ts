import { getSession } from "@/auth";
import { Prisma } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";

export type DashboardUsuarioOption = { id: string; usuario: string; nombre: string | null };

export type DashboardDateRange = {
  from?: string;
  to?: string;
  usuarioId?: string;
};

export type DashboardMetrics = {
  range: {
    from: string;
    to: string;
    label: string;
  };
  scopeLabel: string;
  kpis: {
    ventasTotales: number;
    totalClientes: number;
    totalVentas: number;
    totalProductos: number;
  };
  productosMasVendidos: Array<{ id: string; nombre: string; cantidad: number; total: number }>;
  productosMenosVendidos: Array<{ id: string; nombre: string; cantidad: number; total: number }>;
  topClientesConMasVentas: Array<{ id: string; nombre: string; cantidadVentas: number; total: number }>;
  topClientesSinVentas: Array<{ id: string; nombre: string; ultimaVenta: string | null }>
  tareasHoy: Array<{ id: string; titulo: string; estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA"; cliente: string; fechaObjetivo: string }>;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseInputDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function buildRange(range: DashboardDateRange) {
  const today = new Date();
  const defaultFrom = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const defaultTo = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  let from = parseInputDate(range.from, defaultFrom);
  let to = parseInputDate(range.to, defaultTo);

  if (from > to) {
    [from, to] = [to, from];
  }

  const toExclusive = new Date(to.getTime() + DAY_IN_MS);

  return {
    from,
    to,
    toExclusive,
    fromInput: toInputDate(from),
    toInput: toInputDate(to),
  };
}

function decimalToNumber(value: Prisma.Decimal | number | null | undefined) {
  return Number(value ?? 0);
}

export function getCurrentMonthRange() {
  const today = new Date();
  const from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const to = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  return { from: toInputDate(from), to: toInputDate(to) };
}

export function getCurrentWeekRange() {
  const today = new Date();
  const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const day = utcToday.getUTCDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  const from = new Date(utcToday.getTime() - daysFromMonday * DAY_IN_MS);

  return { from: toInputDate(from), to: toInputDate(utcToday) };
}

export async function getDashboardUsuarios(): Promise<DashboardUsuarioOption[]> {
  const session = await getSession();
  if (!session?.IdUser) return [];

  const puedeVerKpisUsuarios = session.Permiso?.includes("acceso_kpi_usuarios") ?? false;
  if (!puedeVerKpisUsuarios) return [];

  return prisma.usuarios.findMany({
    where: { activo: true },
    select: { id: true, usuario: true, nombre: true },
    orderBy: [{ nombre: "asc" }, { usuario: "asc" }],
  });
}

export async function getDashboardMetrics(range: DashboardDateRange): Promise<DashboardMetrics> {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para consultar el dashboard");

  const puedeVerTodasVentas = session.Permiso?.includes("ver_todas_ventas") ?? false;
  const puedeVerTodosClientes = session.Permiso?.includes("ver_todos_clientes") ?? false;
  const puedeVerKpisUsuarios = session.Permiso?.includes("acceso_kpi_usuarios") ?? false;
  const dateRange = buildRange(range);

  const usuarioSeleccionadoId = puedeVerKpisUsuarios && range.usuarioId ? range.usuarioId : session.IdUser;

  const ventaWhere: Prisma.VentaWhereInput = {
    createAt: { gte: dateRange.from, lt: dateRange.toExclusive },
    ...(puedeVerTodasVentas || puedeVerKpisUsuarios ? { usuarioId: usuarioSeleccionadoId } : { usuarioId: session.IdUser }),
  };
  const clienteWhere: Prisma.ClienteWhereInput =
    puedeVerKpisUsuarios
      ? { usuarioAsignadoId: usuarioSeleccionadoId }
      : puedeVerTodosClientes
        ? {}
        : { usuarioAsignadoId: session.IdUser };
  const ventaProductoWhere: Prisma.VentaProductoWhereInput = { venta: ventaWhere };

  const inicioHoy = new Date();
  const hoyDesde = new Date(Date.UTC(inicioHoy.getUTCFullYear(), inicioHoy.getUTCMonth(), inicioHoy.getUTCDate()));
  const hoyHasta = new Date(hoyDesde.getTime() + DAY_IN_MS);

  const [ventasAggregate, totalClientes, totalVentas, totalProductos, productos, productosVendidosGroup, clientesVendidosGroup, clientesVisibles, tareasHoy] = await Promise.all([
    prisma.venta.aggregate({ where: ventaWhere, _sum: { total: true } }),
    prisma.cliente.count({ where: clienteWhere }),
    prisma.venta.count({ where: ventaWhere }),
    prisma.producto.count({ where: { activo: true } }),
    prisma.producto.findMany({ where: { activo: true }, select: { id: true, nombre: true }, orderBy: { nombre: "asc" } }),
    prisma.ventaProducto.groupBy({
      by: ["productoId"],
      where: ventaProductoWhere,
      _sum: { cantidad: true, subtotal: true },
    }),
    prisma.venta.groupBy({
      by: ["clienteId"],
      where: ventaWhere,
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
    prisma.cliente.findMany({
      where: clienteWhere,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        ventas: {
          where: puedeVerTodasVentas || puedeVerKpisUsuarios ? { usuarioId: usuarioSeleccionadoId } : { usuarioId: session.IdUser },
          select: { createAt: true },
          orderBy: { createAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ nombre: "asc" }, { apellido: "asc" }],
    }),
    prisma.tarea.findMany({
      where: {
        usuarioId: usuarioSeleccionadoId,
        fechaObjetivo: { gte: hoyDesde, lt: hoyHasta },
        estado: { not: "COMPLETADA" },
      },
      select: {
        id: true,
        titulo: true,
        estado: true,
        fechaObjetivo: true,
        nota: { select: { cliente: { select: { nombre: true, apellido: true } } } },
      },
      orderBy: { createAt: "asc" },
      take: 10,
    }),
  ]);

  const productosPorId = new Map(productos.map((producto) => [producto.id, producto.nombre]));
  const productosVendidos = productosVendidosGroup.map((item) => ({
    id: item.productoId,
    nombre: productosPorId.get(item.productoId) ?? "Producto eliminado",
    cantidad: item._sum.cantidad ?? 0,
    total: decimalToNumber(item._sum.subtotal),
  }));

  const productosMenosVendidos = productos
    .map((producto) => {
      const vendido = productosVendidos.find((item) => item.id === producto.id);
      return vendido ?? { id: producto.id, nombre: producto.nombre, cantidad: 0, total: 0 };
    })
    .sort((a, b) => a.cantidad - b.cantidad || a.nombre.localeCompare(b.nombre))
    .slice(0, 5);

  const clienteIds = clientesVendidosGroup.map((item) => item.clienteId);
  const clientesTop = clienteIds.length
    ? await prisma.cliente.findMany({
        where: { id: { in: clienteIds } },
        select: { id: true, nombre: true, apellido: true },
      })
    : [];
  const clientesPorId = new Map(clientesTop.map((cliente) => [cliente.id, `${cliente.nombre} ${cliente.apellido}`]));
  const clientesConVentasEnRango = new Set(clientesVendidosGroup.map((item) => item.clienteId));

  return {
    range: {
      from: dateRange.fromInput,
      to: dateRange.toInput,
      label: `${dateRange.fromInput} al ${dateRange.toInput}`,
    },
    scopeLabel: puedeVerKpisUsuarios
      ? `Ventas de ${usuarioSeleccionadoId === session.IdUser ? "mi usuario" : "usuario seleccionado"}`
      : puedeVerTodasVentas
        ? "Todas las ventas"
        : "Mis ventas",
    kpis: {
      ventasTotales: decimalToNumber(ventasAggregate._sum.total),
      totalClientes,
      totalVentas,
      totalProductos,
    },
    productosMasVendidos: productosVendidos.sort((a, b) => b.cantidad - a.cantidad || b.total - a.total).slice(0, 5),
    productosMenosVendidos,
    topClientesConMasVentas: clientesVendidosGroup.map((item) => ({
      id: item.clienteId,
      nombre: clientesPorId.get(item.clienteId) ?? "Cliente eliminado",
      cantidadVentas: item._count.id,
      total: decimalToNumber(item._sum.total),
    })),
    tareasHoy: tareasHoy.map((t) => ({
      id: t.id,
      titulo: t.titulo,
      estado: t.estado,
      cliente: `${t.nota.cliente.nombre} ${t.nota.cliente.apellido}`.trim(),
      fechaObjetivo: t.fechaObjetivo.toISOString().slice(0, 10),
    })),
    topClientesSinVentas: clientesVisibles
      .filter((cliente) => !clientesConVentasEnRango.has(cliente.id))
      .map((cliente) => ({
        id: cliente.id,
        nombre: `${cliente.nombre} ${cliente.apellido}`,
        ultimaVenta: cliente.ventas[0]?.createAt.toISOString().slice(0, 10) ?? null,
      }))
      .slice(0, 5),
  };
}
