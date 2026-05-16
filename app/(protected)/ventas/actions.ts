"use server";
import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";
import { Venta } from "./schema";

export async function getVentas() {
  return prisma.venta.findMany({
    include: {
      cliente: true,
      usuario: { select: { usuario: true } },
      productos: { include: { producto: { select: { id: true, nombre: true, precio: true } } } },
    },
    orderBy: { createAt: "desc" },
  });
}

export async function getVentaById(id: string) {
  return prisma.venta.findUnique({
    where: { id },
    include: { productos: { include: { producto: { select: { id: true, nombre: true, precio: true } } } } },
  });
}

async function getCurrentUser() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para registrar ventas");
  return session;
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
    select: { id: true, precio: true },
  });

  const precios = new Map(productosDb.map((producto) => [producto.id, producto.precio]));

  const detalles = productos.map((item) => {
    const precioUnitario = precios.get(item.productoId);
    if (!precioUnitario) throw new Error("Uno de los productos seleccionados no está disponible");

    const subtotal = new Prisma.Decimal(precioUnitario).mul(item.cantidad);
    return {
      productoId: item.productoId,
      cantidad: item.cantidad,
      precioUnitario,
      subtotal,
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
      productos: { create: detalles },
    },
  });

  revalidatePath("/ventas");
  return venta;
}

export async function updateVenta(data: Venta) {
  if (!data.id) throw new Error("ID de venta requerido");

  const session = await getCurrentUser();
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
        productos: { create: detalles },
      },
    });
  });

  revalidatePath("/ventas");
  return venta;
}
