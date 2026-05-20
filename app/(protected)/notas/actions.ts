"use server";

import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Nota } from "./schema";

async function getCurrentUser() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida");
  return session;
}

export async function getNotas() {
  const session = await getCurrentUser();
  const puedeVerTodos = session.Permiso?.includes("ver_todos_clientes") ?? false;

  return prisma.nota.findMany({
    where: puedeVerTodos ? undefined : { cliente: { usuarioAsignadoId: session.IdUser } },
    include: { cliente: { select: { id: true, nombre: true, apellido: true } }, usuario: { select: { id: true, usuario: true } }, evidencias: true },
    orderBy: { createAt: "desc" },
  });
}

export async function getNotaById(id: string) {
  const session = await getCurrentUser();
  const puedeVerTodos = session.Permiso?.includes("ver_todos_clientes") ?? false;
  return prisma.nota.findFirst({ where: { id, ...(puedeVerTodos ? {} : { cliente: { usuarioAsignadoId: session.IdUser } }) }, include: { evidencias: true } });
}

export async function createNota(data: Nota) {
  const session = await getCurrentUser();
  const cliente = await prisma.cliente.findFirst({ where: { id: data.clienteId, ...(session.Permiso?.includes("ver_todos_clientes") ? {} : { usuarioAsignadoId: session.IdUser }) }, select: { id: true } });
  if (!cliente) throw new Error("No tienes acceso al cliente seleccionado");

  const nota = await prisma.nota.create({ data: { clienteId: data.clienteId, usuarioId: session.IdUser, contenido: data.contenido, evidencias: { create: (data.evidencias ?? []).map((imagenB64) => ({ imagenB64 })) } } });
  revalidatePath("/notas");
  return nota;
}

export async function updateNota(data: Nota) {
  if (!data.id) throw new Error("ID requerido");
  const session = await getCurrentUser();
  const nota = await getNotaById(data.id);
  if (!nota) throw new Error("Nota no encontrada o sin acceso");

  await prisma.nota.update({ where: { id: data.id }, data: { contenido: data.contenido, evidencias: { deleteMany: {}, create: (data.evidencias ?? []).map((imagenB64) => ({ imagenB64 })) } } });
  revalidatePath("/notas");
}
