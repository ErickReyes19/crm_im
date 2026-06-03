"use server";
import { getSession } from "@/auth";
import { getScopedUserIds } from "@/lib/access-scope";
import { resolveListDateRange, type ListDateRangeInput } from "@/lib/list-date-range";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";
import { Venta } from "./schema";


function aplicarDescuento(precioUnitario: Prisma.Decimal, tipoPrecio: "NORMAL" | "DESCUENTO_10" | "DESCUENTO_20" | "DESCUENTO_30") {
  if (tipoPrecio === "DESCUENTO_10") return precioUnitario.mul(new Prisma.Decimal(0.9));
  if (tipoPrecio === "DESCUENTO_20") return precioUnitario.mul(new Prisma.Decimal(0.8));
  if (tipoPrecio === "DESCUENTO_30") return precioUnitario.mul(new Prisma.Decimal(0.7));
  return precioUnitario;
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
      productos: { include: { producto: { select: { id: true, nombre: true, descripcion: true } } } },
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
      productos: { include: { producto: { select: { id: true, nombre: true, descripcion: true } } } },
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

async function assertClienteAsignado(clienteId: string, usuarioId: string) {
  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, usuarioAsignadoId: usuarioId },
    select: { id: true },
  });

  if (!cliente) throw new Error("El cliente seleccionado no está asignado a tu usuario");
}

async function buildVentaProductos(productos: Venta["productos"]) {
  const productoIds = [...new Set(productos.map((item) => item.productoId))];
  const productosDb = await prisma.producto.findMany({
    where: { id: { in: productoIds }, activo: true },
    select: { id: true },
  });
  const productosActivos = new Set(productosDb.map((producto) => producto.id));

  const detalles = productos.map((item) => {
    if (!productosActivos.has(item.productoId)) throw new Error("Uno de los productos seleccionados no está disponible");

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

  const total = detalles.reduce((sum, item) => sum.add(item.subtotal), new Prisma.Decimal(0));
  return { detalles, total };
}

export async function createVenta(data: Venta) {
  const session = await getCurrentUser();
  await assertClienteAsignado(data.clienteId, session.IdUser);
  const { detalles, total } = await buildVentaProductos(data.productos);
  const venta = await prisma.venta.create({
    data: {
      clienteId: data.clienteId,
      usuarioId: session.IdUser,
      total,
      estado: data.estado,
      metodoPago: data.metodoPago,
      evidenciaTransferenciaB64: data.metodoPago === "TRANSFERENCIA" ? data.evidenciaTransferenciaB64 : null,
      productos: { create: detalles },
    },
  });

  revalidatePath("/ventas");
  revalidatePath("/dashboard");
  return { id: venta.id, total: Number(venta.total) };
}

export async function updateVenta(data: Venta) {
  if (!data.id) throw new Error("ID de venta requerido");

  const session = await getCurrentUser();
  await assertVentaAccesible(data.id, session);
  await assertClienteAsignado(data.clienteId, session.IdUser);
  const { detalles, total } = await buildVentaProductos(data.productos);
  const venta = await prisma.$transaction(async (tx) => {
    await tx.ventaProducto.deleteMany({ where: { ventaId: data.id } });
    return tx.venta.update({
      where: { id: data.id },
      data: {
        clienteId: data.clienteId,
        usuarioId: session.IdUser,
        total,
        estado: data.estado,
        metodoPago: data.metodoPago,
        evidenciaTransferenciaB64: data.metodoPago === "TRANSFERENCIA" ? data.evidenciaTransferenciaB64 : null,
        productos: { create: detalles },
      },
    });
  });

  revalidatePath("/ventas");
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
