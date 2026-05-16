"use server";
import { getSession } from "@/auth";
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

async function getCurrentUserId() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para registrar ventas");
  return session.IdUser;
}

async function assertClienteAsignado(clienteId: string, usuarioId: string) {
  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, usuarioAsignadoId: usuarioId },
    select: { id: true },
  });

  if (!cliente) throw new Error("El cliente seleccionado no está asignado a tu usuario");
}

export async function createVenta(data: Venta) {
  const usuarioId = await getCurrentUserId();
  await assertClienteAsignado(data.clienteId, usuarioId);

  return prisma.venta.create({
    data: {
      clienteId: data.clienteId,
      usuarioId,
      total: data.total,
      estado: data.estado,
    },
  });
}

export async function updateVenta(data: Venta) {
  if (!data.id) throw new Error("ID de venta requerido");

  const usuarioId = await getCurrentUserId();
  await assertClienteAsignado(data.clienteId, usuarioId);

  return prisma.venta.update({
    where: { id: data.id },
    data: {
      clienteId: data.clienteId,
      usuarioId,
      total: data.total,
      estado: data.estado,
    },
  });
}
