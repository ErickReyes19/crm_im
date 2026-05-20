"use server";
import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Tarea } from "./schema";

async function getCurrentUser() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida");
  return session;
}

export async function getNotasOpciones() {
  const session = await getCurrentUser();
  return prisma.nota.findMany({
    where: session.Permiso?.includes("ver_todos_clientes") ? undefined : { cliente: { usuarioAsignadoId: session.IdUser } },
    select: { id: true, contenido: true, cliente: { select: { nombre: true, apellido: true } } },
    orderBy: { createAt: "desc" },
    take: 100,
  });
}

export async function getTareas() {
  const session = await getCurrentUser();
  return prisma.tarea.findMany({
    where: { usuarioId: session.IdUser },
    include: { nota: { include: { cliente: { select: { nombre: true, apellido: true } } } } },
    orderBy: { fechaObjetivo: "asc" },
  });
}

export async function getTareaById(id: string) {
  const session = await getCurrentUser();
  return prisma.tarea.findFirst({ where: { id, usuarioId: session.IdUser } });
}

export async function createTarea(data: Tarea) {
  const session = await getCurrentUser();
  const nota = await prisma.nota.findFirst({ where: { id: data.notaId, cliente: { usuarioAsignadoId: session.IdUser } }, select: { id: true } });
  if (!nota) throw new Error("No tienes acceso a la nota seleccionada");

  await prisma.tarea.create({ data: { ...data, usuarioId: session.IdUser } });
  revalidatePath("/tareas");
}

export async function updateTarea(data: Tarea) {
  if (!data.id) throw new Error("ID requerido");
  const session = await getCurrentUser();
  const tarea = await prisma.tarea.findFirst({ where: { id: data.id, usuarioId: session.IdUser }, select: { id: true } });
  if (!tarea) throw new Error("Tarea no encontrada");

  await prisma.tarea.update({ where: { id: data.id }, data: { notaId: data.notaId, titulo: data.titulo, descripcion: data.descripcion, fechaObjetivo: data.fechaObjetivo, estado: data.estado } });
  revalidatePath("/tareas");
}
