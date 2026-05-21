"use server";
import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";
import { Venta } from "./schema";


function aplicarDescuento(precioUnitario: Prisma.Decimal, tipoPrecio: "NORMAL" | "DESCUENTO_10" | "DESCUENTO_20") {
  if (tipoPrecio === "DESCUENTO_10") return precioUnitario.mul(new Prisma.Decimal(0.9));
  if (tipoPrecio === "DESCUENTO_20") return precioUnitario.mul(new Prisma.Decimal(0.8));
  return precioUnitario;
}


export async function getVentas() {
  const session = await getCurrentUser();
  const puedeVerTodas = session.Permiso?.includes("ver_todas_ventas") ?? false;

  return prisma.venta.findMany({
    where: puedeVerTodas ? undefined : { usuarioId: session.IdUser },
    include: {
      cliente: true,
      usuario: { select: { usuario: true } },
      productos: { include: { producto: { select: { id: true, nombre: true } } } },
    },
    orderBy: { createAt: "desc" },
  });
}

export async function getVentaById(id: string) {
  const session = await getCurrentUser();
  const puedeVerTodas = session.Permiso?.includes("ver_todas_ventas") ?? false;

  return prisma.venta.findFirst({
    where: { id, ...(puedeVerTodas ? {} : { usuarioId: session.IdUser }) },
    include: { productos: { include: { producto: { select: { id: true, nombre: true } } } } },
  });
}

async function getCurrentUser() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para registrar ventas");
  return session;
}


async function assertVentaAccesible(ventaId: string, usuarioId: string, permisos: string[] | undefined) {
  const puedeVerTodas = permisos?.includes("ver_todas_ventas") ?? false;
  const venta = await prisma.venta.findFirst({
    where: { id: ventaId, ...(puedeVerTodas ? {} : { usuarioId }) },
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
  const totalFinal = data.total !== undefined ? new Prisma.Decimal(data.total) : total;

  const venta = await prisma.venta.create({
    data: {
      clienteId: data.clienteId,
      usuarioId: session.IdUser,
      total: totalFinal,
      estado: data.estado,
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
  await assertVentaAccesible(data.id, session.IdUser, session.Permiso);
  await assertClienteAsignado(data.clienteId, session.IdUser);
  const { detalles, total } = await buildVentaProductos(data.productos);
  const totalFinal = data.total !== undefined ? new Prisma.Decimal(data.total) : total;

  const venta = await prisma.$transaction(async (tx) => {
    await tx.ventaProducto.deleteMany({ where: { ventaId: data.id } });
    return tx.venta.update({
      where: { id: data.id },
      data: {
        clienteId: data.clienteId,
        usuarioId: session.IdUser,
        total: totalFinal,
        estado: data.estado,
        productos: { create: detalles },
      },
    });
  });

  revalidatePath("/ventas");
  revalidatePath("/dashboard");
  return { id: venta.id, total: Number(venta.total) };
}
