"use server";
import { getSession } from "@/auth";
import { getScopedUserIds } from "@/lib/access-scope";
import { resolveListDateRange, type ListDateRangeInput } from "@/lib/list-date-range";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";
import { Venta } from "./schema";


type VentaDetalleInput = {
  productoId: string;
  cantidad: number;
  precioUnitario: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  tipoPrecio: "NORMAL" | "DESCUENTO_10" | "DESCUENTO_15" | "DESCUENTO_20" | "DESCUENTO_30";
};

const ISV_RATE = new Prisma.Decimal(0.15);

function aplicarDescuento(precioUnitario: Prisma.Decimal, tipoPrecio: "NORMAL" | "DESCUENTO_10" | "DESCUENTO_15" | "DESCUENTO_20" | "DESCUENTO_30") {
  if (tipoPrecio === "DESCUENTO_10") return precioUnitario.mul(new Prisma.Decimal(0.9));
  if (tipoPrecio === "DESCUENTO_15") return precioUnitario.mul(new Prisma.Decimal(0.85));
  if (tipoPrecio === "DESCUENTO_20") return precioUnitario.mul(new Prisma.Decimal(0.8));
  if (tipoPrecio === "DESCUENTO_30") return precioUnitario.mul(new Prisma.Decimal(0.7));
  return precioUnitario;
}

function calcularTotalesVenta(subtotalProductos: Prisma.Decimal, tipoDocumento: Venta["tipoDocumento"]) {
  if (tipoDocumento !== "FACTURA") return { total: subtotalProductos, isv: new Prisma.Decimal(0) };

  const isv = subtotalProductos.mul(ISV_RATE);
  return { total: subtotalProductos.sub(isv), isv };
}


export async function getVentas(range?: ListDateRangeInput) {
  const session = await getCurrentUser();
  const ventaScopeWhere = await getVentaScopeWhere(session);
  const dateRange = resolveListDateRange(range);

  return prisma.venta.findMany({
    where: { ...ventaScopeWhere, createAt: { gte: dateRange.from, lt: dateRange.toExclusive } },
    include: {
      cliente: true,
      usuario: { select: { id: true, usuario: true, nombre: true } },
      productos: { include: { producto: { select: { id: true, nombre: true, descripcion: true, stock: true, stockMinimo: true } } } },
    },
    orderBy: { createAt: "desc" },
  });
}

export async function getVentaById(id: string) {
  const session = await getCurrentUser();
  const ventaScopeWhere = await getVentaScopeWhere(session);

  return prisma.venta.findFirst({
    where: { id, ...ventaScopeWhere },
    include: {
      cliente: true,
      usuario: { select: { id: true, usuario: true, nombre: true } },
      productos: { include: { producto: { select: { id: true, nombre: true, descripcion: true, stock: true, stockMinimo: true } } } },
    },
  });
}

async function getCurrentUser() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para registrar ventas");
  return session;
}

async function getVentaScopeWhere(session: Awaited<ReturnType<typeof getCurrentUser>>): Promise<Prisma.VentaWhereInput> {
  const scopedUserIds = await getScopedUserIds(session);
  return { cliente: { usuarioAsignadoId: { in: scopedUserIds } } };
}

async function assertVentaAccesible(ventaId: string, session: Awaited<ReturnType<typeof getCurrentUser>>) {
  const ventaScopeWhere = await getVentaScopeWhere(session);
  const venta = await prisma.venta.findFirst({
    where: { id: ventaId, ...ventaScopeWhere },
    select: { id: true },
  });

  if (!venta) throw new Error("No tienes acceso a esta venta");
}

async function assertClienteAccesible(clienteId: string, session: Awaited<ReturnType<typeof getCurrentUser>>) {
  const scopedUserIds = await getScopedUserIds(session);
  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, usuarioAsignadoId: { in: scopedUserIds } },
    select: { id: true },
  });

  if (!cliente) throw new Error("No tienes acceso al cliente seleccionado");
}

async function buildVentaProductos(productos: Venta["productos"]) {
  const productoIds = [...new Set(productos.map((item) => item.productoId))];
  const productosDb = await prisma.producto.findMany({
    where: { id: { in: productoIds }, activo: true },
    select: { id: true, nombre: true },
  });
  const productosActivos = new Map(productosDb.map((producto) => [producto.id, producto]));

  const detalles = productos.map((item) => {
    const producto = productosActivos.get(item.productoId);
    if (!producto) throw new Error("Uno de los productos seleccionados no está disponible");

    const precioUnitario = new Prisma.Decimal(item.precioUnitario);
    const precioAplicado = aplicarDescuento(precioUnitario, item.tipoPrecio);
    const subtotal = precioAplicado.mul(item.cantidad);
    return {
      productoId: item.productoId,
      cantidad: item.cantidad,
      precioUnitario,
      subtotal,
      tipoPrecio: item.tipoPrecio,
    };
  });

  const subtotalProductos = detalles.reduce((sum, item) => sum.add(item.subtotal), new Prisma.Decimal(0));
  return { detalles, subtotalProductos };
}

function getCantidadesPorProducto(detalles: Array<Pick<VentaDetalleInput, "productoId" | "cantidad">>) {
  return detalles.reduce((acc, item) => {
    acc.set(item.productoId, (acc.get(item.productoId) ?? 0) + item.cantidad);
    return acc;
  }, new Map<string, number>());
}

async function aplicarMovimientoInventario(tx: Prisma.TransactionClient, cantidadesPorProducto: Map<string, number>) {
  for (const [productoId, cantidad] of cantidadesPorProducto.entries()) {
    if (cantidad === 0) continue;

    if (cantidad > 0) {
      const result = await tx.producto.updateMany({
        where: { id: productoId, stock: { gte: cantidad } },
        data: { stock: { decrement: cantidad } },
      });

      if (result.count === 0) {
        const producto = await tx.producto.findUnique({ where: { id: productoId }, select: { nombre: true, stock: true } });
        throw new Error(`Stock insuficiente para ${producto?.nombre ?? "el producto seleccionado"}. Disponible: ${producto?.stock ?? 0}`);
      }
    } else {
      await tx.producto.update({
        where: { id: productoId },
        data: { stock: { increment: Math.abs(cantidad) } },
      });
    }
  }
}

export async function createVenta(data: Venta) {
  const session = await getCurrentUser();
  await assertClienteAccesible(data.clienteId, session);
  const { detalles, subtotalProductos } = await buildVentaProductos(data.productos);
  const { total, isv } = calcularTotalesVenta(subtotalProductos, data.tipoDocumento);
  const venta = await prisma.$transaction(async (tx) => {
    await aplicarMovimientoInventario(tx, getCantidadesPorProducto(detalles));

    return tx.venta.create({
      data: {
        clienteId: data.clienteId,
        usuarioId: session.IdUser,
        total,
        isv,
        tipoDocumento: data.tipoDocumento,
        conEnvio: data.conEnvio,
        envio: data.conEnvio ? new Prisma.Decimal(data.envio) : new Prisma.Decimal(0),
        estado: data.estado,
        metodoPago: data.metodoPago,
        evidenciaTransferenciaUbicacion: data.metodoPago === "TRANSFERENCIA" ? data.evidenciaTransferenciaUbicacion : null,
        evidenciaTransferenciaNombre: data.metodoPago === "TRANSFERENCIA" ? data.evidenciaTransferenciaNombre : null,
        productos: { create: detalles },
      },
    });
  });

  revalidatePath("/ventas");
  revalidatePath("/productos");
  revalidatePath("/dashboard");
  return { id: venta.id, total: Number(venta.total) };
}

export async function updateVenta(data: Venta) {
  if (!data.id) throw new Error("ID de venta requerido");

  const session = await getCurrentUser();
  await assertVentaAccesible(data.id, session);
  await assertClienteAccesible(data.clienteId, session);
  const { detalles, subtotalProductos } = await buildVentaProductos(data.productos);
  const { total, isv } = calcularTotalesVenta(subtotalProductos, data.tipoDocumento);
  const venta = await prisma.$transaction(async (tx) => {
    const detallesAnteriores = await tx.ventaProducto.findMany({
      where: { ventaId: data.id },
      select: { productoId: true, cantidad: true },
    });
    const cantidadesPrevias = getCantidadesPorProducto(detallesAnteriores);
    const cantidadesNuevas = getCantidadesPorProducto(detalles);
    const movimientos = new Map<string, number>();

    for (const productoId of new Set([...cantidadesPrevias.keys(), ...cantidadesNuevas.keys()])) {
      movimientos.set(productoId, (cantidadesNuevas.get(productoId) ?? 0) - (cantidadesPrevias.get(productoId) ?? 0));
    }

    await aplicarMovimientoInventario(tx, movimientos);
    await tx.ventaProducto.deleteMany({ where: { ventaId: data.id } });
    return tx.venta.update({
      where: { id: data.id },
      data: {
        clienteId: data.clienteId,
        usuarioId: session.IdUser,
        total,
        isv,
        tipoDocumento: data.tipoDocumento,
        conEnvio: data.conEnvio,
        envio: data.conEnvio ? new Prisma.Decimal(data.envio) : new Prisma.Decimal(0),
        estado: data.estado,
        metodoPago: data.metodoPago,
        evidenciaTransferenciaUbicacion: data.metodoPago === "TRANSFERENCIA" ? data.evidenciaTransferenciaUbicacion : null,
        evidenciaTransferenciaNombre: data.metodoPago === "TRANSFERENCIA" ? data.evidenciaTransferenciaNombre : null,
        productos: { create: detalles },
      },
    });
  });

  revalidatePath("/ventas");
  revalidatePath("/productos");
  revalidatePath("/dashboard");
  return { id: venta.id, total: Number(venta.total) };
}

export async function cambiarEstadoVenta(id: string, estado: "PROCESO" | "ENVIO" | "ENTREGADA") {
  const session = await getCurrentUser();
  if (!session.Permiso?.includes("editar_venta")) throw new Error("No tienes permiso para cambiar el estado de la venta");

  await assertVentaAccesible(id, session);

  const venta = await prisma.venta.update({
    where: { id },
    data: { estado },
    select: { id: true, estado: true },
  });

  revalidatePath("/ventas");
  revalidatePath("/dashboard");
  return venta;
}
