import { getSession } from "@/auth";
import { Prisma } from "@/lib/generated/prisma";
import { getScopedUserIds } from "@/lib/access-scope";
import { formatHondurasInputDate } from "@/lib/date-format";
import { getDateRangePresetInputs, resolveListDateRange } from "@/lib/list-date-range";
import { prisma } from "@/lib/prisma";

export const DASHBOARD_ALL_USERS_VALUE = "__all__";

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
    clientesSinNotas: number;
  };
  productosMasVendidos: Array<{ id: string; nombre: string; cantidad: number; total: number }>;
  productosMenosVendidos: Array<{ id: string; nombre: string; cantidad: number; total: number }>;
  topClientesConMasVentas: Array<{ id: string; nombre: string; cantidadVentas: number; total: number }>;
  topClientesSinVentas: Array<{ id: string; nombre: string; ultimaVenta: string | null }>;
  clientesUltimaNota: Array<{ id: string; nombre: string; ultimaNota: string | null; diasDesdeUltimaNota: number | null }>;
  tareasHoy: Array<{ id: string; titulo: string; estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA"; cliente: string; fechaObjetivo: string }>;
  fechaHoy: string;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function buildRange(range: DashboardDateRange) {
  const defaultMonth = getDateRangePresetInputs("month");
  return resolveListDateRange({
    from: range.from || defaultMonth.from,
    to: range.to || defaultMonth.to,
  });
}

function decimalToNumber(value: Prisma.Decimal | number | null | undefined) {
  return Number(value ?? 0);
}

function isSuperAdminSession(session: Awaited<ReturnType<typeof getSession>>) {
  const rol = session?.Rol?.toLowerCase();
  return rol === "super_admin" || rol === "super admin" || session?.Permiso?.includes("super_admin") === true;
}

export function getCurrentMonthRange() {
  return getDateRangePresetInputs("month");
}

export function getCurrentWeekRange() {
  return getDateRangePresetInputs("week");
}

export async function getDashboardUsuarios(): Promise<DashboardUsuarioOption[]> {
  const session = await getSession();
  if (!session?.IdUser) return [];

  const puedeVerKpisUsuarios = session.Permiso?.includes("acceso_kpi_usuarios") ?? false;
  if (!puedeVerKpisUsuarios) return [];

  const scopedUserIds = await getScopedUserIds(session);
  return prisma.usuarios.findMany({
    where: { activo: true, id: { in: scopedUserIds, not: session.IdUser } },
    select: { id: true, usuario: true, nombre: true },
    orderBy: [{ nombre: "asc" }, { usuario: "asc" }],
  });
}

export async function getDashboardMetrics(range: DashboardDateRange): Promise<DashboardMetrics> {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para consultar el dashboard");

  const puedeVerKpisUsuarios = session.Permiso?.includes("acceso_kpi_usuarios") ?? false;
  const dateRange = buildRange(range);
  const scopedUserIds = await getScopedUserIds(session);

  const puedeVerTodo = puedeVerKpisUsuarios && isSuperAdminSession(session) && range.usuarioId === DASHBOARD_ALL_USERS_VALUE;
  const usuarioSeleccionadoId =
    puedeVerKpisUsuarios && range.usuarioId && scopedUserIds.includes(range.usuarioId)
      ? range.usuarioId
      : session.IdUser;

  const usuariosObjetivo = puedeVerKpisUsuarios
    ? puedeVerTodo
      ? scopedUserIds
      : [usuarioSeleccionadoId]
    : [session.IdUser];

  const ventaWhere: Prisma.VentaWhereInput = {
    createAt: { gte: dateRange.from, lt: dateRange.toExclusive },
    usuarioId: { in: usuariosObjetivo },
  };
  const clienteWhere: Prisma.ClienteWhereInput = { usuarioAsignadoId: { in: usuariosObjetivo } };
  const ventaProductoWhere: Prisma.VentaProductoWhereInput = { venta: ventaWhere };

  const todayRange = resolveListDateRange(getDateRangePresetInputs("today"));

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
          where: { usuarioId: { in: usuariosObjetivo } },
          select: { createAt: true },
          orderBy: { createAt: "desc" },
          take: 1,
        },
        notas: {
          where: { usuarioId: { in: usuariosObjetivo } },
          select: { createAt: true },
          orderBy: { createAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ nombre: "asc" }, { apellido: "asc" }],
    }),
    prisma.tarea.findMany({
      where: {
        usuarioId: { in: usuariosObjetivo },
        fechaObjetivo: { gte: todayRange.from, lt: todayRange.toExclusive },
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
  const clientesUltimaNota = clientesVisibles
    .map((cliente) => {
      const ultimaNota = cliente.notas[0]?.createAt ?? null;
      const diasDesdeUltimaNota = ultimaNota
        ? Math.max(0, Math.floor((todayRange.from.getTime() - resolveListDateRange({
          from: formatHondurasInputDate(ultimaNota),
          to: formatHondurasInputDate(ultimaNota),
        }).from.getTime()) / DAY_IN_MS))
        : null;

      return {
        id: cliente.id,
        nombre: `${cliente.nombre} ${cliente.apellido}`.trim(),
        ultimaNota: ultimaNota ? formatHondurasInputDate(ultimaNota) : null,
        diasDesdeUltimaNota,
      };
    })
    .sort((a, b) => {
      if (a.diasDesdeUltimaNota === null && b.diasDesdeUltimaNota === null) return a.nombre.localeCompare(b.nombre);
      if (a.diasDesdeUltimaNota === null) return -1;
      if (b.diasDesdeUltimaNota === null) return 1;
      return b.diasDesdeUltimaNota - a.diasDesdeUltimaNota || a.nombre.localeCompare(b.nombre);
    });

  return {
    range: {
      from: dateRange.fromInput,
      to: dateRange.toInput,
      label: `${dateRange.fromInput} al ${dateRange.toInput}`,
    },
    scopeLabel: puedeVerKpisUsuarios
      ? puedeVerTodo
        ? "Ventas de todos los usuarios"
        : `Ventas de ${usuarioSeleccionadoId === session.IdUser ? "mi usuario" : "usuario seleccionado"}`
      : "Mis ventas",
    kpis: {
      ventasTotales: decimalToNumber(ventasAggregate._sum.total),
      totalClientes,
      totalVentas,
      totalProductos,
      clientesSinNotas: clientesUltimaNota.filter((cliente) => cliente.ultimaNota === null).length,
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
      fechaObjetivo: formatHondurasInputDate(t.fechaObjetivo),
    })),
    fechaHoy: todayRange.toInput,
    clientesUltimaNota: clientesUltimaNota.slice(0, 10),
    topClientesSinVentas: clientesVisibles
      .filter((cliente) => !clientesConVentasEnRango.has(cliente.id))
      .map((cliente) => ({
        id: cliente.id,
        nombre: `${cliente.nombre} ${cliente.apellido}`,
        ultimaVenta: cliente.ventas[0]?.createAt ? formatHondurasInputDate(cliente.ventas[0].createAt) : null,
      }))
      .slice(0, 5),
  };
}
