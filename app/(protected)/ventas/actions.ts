"use server";
import { prisma } from "@/lib/prisma";
import { Venta } from "./schema";

export async function getVentas() {
  return prisma.venta.findMany({
    include: { cliente: true, usuario: { select: { usuario: true } } },
    orderBy: { createAt: "desc" },
  });
}

export async function getVentaById(id: string) {
  return prisma.venta.findUnique({ where: { id } });
}

export async function createVenta(data: Venta) {
  return prisma.venta.create({
    data: {
      clienteId: data.clienteId,
      usuarioId: data.usuarioId,
      total: data.total,
      estado: data.estado,
    },
  });
}

export async function updateVenta(data: Venta) {
  if (!data.id) throw new Error("ID de venta requerido");

  return prisma.venta.update({
    where: { id: data.id },
    data: {
      clienteId: data.clienteId,
      usuarioId: data.usuarioId,
      total: data.total,
      estado: data.estado,
    },
  });
}
