"use server";

import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Cliente } from "./schema";

export async function getClientes() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para consultar clientes");

  const puedeVerTodos = session.Permiso?.includes("ver_todos_clientes") ?? false;

  return prisma.cliente.findMany({
    where: puedeVerTodos ? undefined : { usuarioAsignadoId: session.IdUser },
    include: { usuarioAsignado: { select: { id: true, usuario: true } } },
    orderBy: { createAt: "desc" },
  });
}

export async function getClienteById(id?: string) {
  if (!id) return null;

  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para consultar clientes");

  const puedeVerTodos = session.Permiso?.includes("ver_todos_clientes") ?? false;

  return prisma.cliente.findFirst({
    where: {
      id,
      ...(puedeVerTodos ? {} : { usuarioAsignadoId: session.IdUser }),
    },
  });
}

export async function createCliente(data: Cliente) {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para crear clientes");

  const cliente = await prisma.cliente.create({
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

  revalidatePath("/clientes");
  return cliente;
}

export async function updateCliente(data: Cliente) {
  if (!data.id) throw new Error("ID de cliente requerido");

  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para actualizar clientes");

  const puedeVerTodos = session.Permiso?.includes("ver_todos_clientes") ?? false;
  const cliente = await prisma.cliente.findFirst({
    where: { id: data.id, ...(puedeVerTodos ? {} : { usuarioAsignadoId: session.IdUser }) },
    select: { id: true },
  });
  if (!cliente) throw new Error("No tienes acceso a este cliente");

  const clienteActualizado = await prisma.cliente.update({
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

  revalidatePath("/clientes");
  return clienteActualizado;
}

export async function transferirCliente(clienteId: string, usuarioAsignadoId: string) {
  const session = await getSession();
  if (!session?.IdUser || !session.Permiso?.includes("asignar_clientes")) {
    throw new Error("No tienes permiso para asignar clientes");
  }

  return prisma.cliente.update({ where: { id: clienteId }, data: { usuarioAsignadoId } });
}

export async function asignarClientesAUsuario(usuarioId: string, clienteIds: string[]) {
  const session = await getSession();
  if (!session?.IdUser || !session.Permiso?.includes("asignar_clientes")) {
    throw new Error("No tienes permiso para asignar clientes");
  }

  if (!usuarioId) throw new Error("Usuario requerido");

  const idsSeleccionados = [...new Set(clienteIds.filter(Boolean))];

  await prisma.$transaction(async (tx: { cliente: { updateMany: typeof prisma.cliente.updateMany } }) => {
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

export async function getClientesAsignadosOpciones() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para consultar clientes asignados");

  return prisma.cliente.findMany({
    select: { id: true, nombre: true, apellido: true },
    where: { usuarioAsignadoId: session.IdUser },
    orderBy: [{ nombre: "asc" }, { apellido: "asc" }],
  });
}
