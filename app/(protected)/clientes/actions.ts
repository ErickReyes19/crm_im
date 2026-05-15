"use server";

import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Cliente } from "./schema";

export async function getClientes() {
  return prisma.cliente.findMany({
    include: { usuarioAsignado: { select: { id: true, usuario: true } } },
    orderBy: { createAt: "desc" },
  });
}

export async function getClienteById(id?: string) {
  if (!id) return null;
  return prisma.cliente.findUnique({ where: { id } });
}

export async function createCliente(data: Cliente) {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para crear clientes");

  return prisma.cliente.create({
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      ciudad: data.ciudad,
      correo: data.correo,
      numero: data.numero,
      direccion: data.direccion,
      etiqueta: data.etiqueta,
      usuarioAsignadoId: session.IdUser,
      activo: true,
    },
  });
}

export async function updateCliente(data: Cliente) {
  if (!data.id) throw new Error("ID de cliente requerido");

  return prisma.cliente.update({
    where: { id: data.id },
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      ciudad: data.ciudad,
      correo: data.correo,
      numero: data.numero,
      direccion: data.direccion,
      etiqueta: data.etiqueta,
      activo: data.activo,
    },
  });
}

export async function transferirCliente(clienteId: string, usuarioAsignadoId: string) {
  return prisma.cliente.update({ where: { id: clienteId }, data: { usuarioAsignadoId } });
}

export async function asignarClientesAUsuario(usuarioId: string, clienteIds: string[]) {
  const session = await getSession();
  if (!session?.IdUser || !session.Permiso?.includes("asignar_clientes")) {
    throw new Error("No tienes permiso para asignar clientes");
  }

  if (!usuarioId) throw new Error("Usuario requerido");

  const idsSeleccionados = [...new Set(clienteIds.filter(Boolean))];

  await prisma.$transaction(async (tx) => {
    if (idsSeleccionados.length > 0) {
      await tx.cliente.updateMany({
        where: { id: { in: idsSeleccionados } },
        data: { usuarioAsignadoId: usuarioId },
      });
    }

    await tx.cliente.updateMany({
      where: {
        usuarioAsignadoId: usuarioId,
        ...(idsSeleccionados.length > 0 ? { id: { notIn: idsSeleccionados } } : {}),
      },
      data: { usuarioAsignadoId: session.IdUser },
    });
  });

  revalidatePath("/clientes");
  revalidatePath("/clientes/asignaciones");
}

export async function getClientesOpciones() {
  return prisma.cliente.findMany({
    select: { id: true, nombre: true, apellido: true },
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });
}
