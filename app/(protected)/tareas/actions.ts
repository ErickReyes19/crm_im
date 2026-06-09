"use server";
import { getSession } from "@/auth";
import { getScopedUserIds } from "@/lib/access-scope";
import { Prisma } from "@/lib/generated/prisma";
import { resolveListDateRange, type ListDateRangeInput } from "@/lib/list-date-range";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Tarea } from "./schema";

async function getCurrentUser() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida");
  return session;
}

async function getScopedIdsForCurrentUser() {
  const session = await getCurrentUser();
  const scopedUserIds = await getScopedUserIds(session);
  return { session, scopedUserIds };
}

async function getTareaScopeWhere(session: Awaited<ReturnType<typeof getCurrentUser>>): Promise<Prisma.TareaWhereInput> {
  const scopedUserIds = await getScopedUserIds(session);
  return { usuarioId: { in: scopedUserIds } };
}

export async function getClientesConNotasOpciones() {
  const { scopedUserIds } = await getScopedIdsForCurrentUser();

  return prisma.cliente.findMany({
    where: {
      activo: true,
      usuarioAsignadoId: { in: scopedUserIds },
      notas: { some: {} },
    },
    select: { id: true, nombre: true, apellido: true, usuarioAsignadoId: true },
    orderBy: [{ nombre: "asc" }, { apellido: "asc" }],
  });
}

export async function getNotasOpcionesByCliente(clienteId: string) {
  if (!clienteId) return [];

  const { scopedUserIds } = await getScopedIdsForCurrentUser();
  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, usuarioAsignadoId: { in: scopedUserIds } },
    select: { id: true },
  });
  if (!cliente) throw new Error("No tienes acceso al cliente seleccionado");

  return prisma.nota.findMany({
    where: { clienteId, cliente: { usuarioAsignadoId: { in: scopedUserIds } } },
    select: { id: true, contenido: true, clienteId: true, cliente: { select: { nombre: true, apellido: true } } },
    orderBy: { createAt: "desc" },
    take: 100,
  });
}

export async function getTareasByClienteId(clienteId: string) {
  if (!clienteId) return [];

  const session = await getCurrentUser();
  const scopedUserIds = await getScopedUserIds(session);
  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, usuarioAsignadoId: { in: scopedUserIds } },
    select: { id: true },
  });
  if (!cliente) return [];

  const tareaScopeWhere = await getTareaScopeWhere(session);

  return prisma.tarea.findMany({
    where: {
      ...tareaScopeWhere,
      nota: { clienteId },
    },
    include: {
      nota: { select: { id: true, contenido: true } },
      usuario: { select: { id: true, usuario: true, nombre: true } },
    },
    orderBy: [{ createAt: "asc" }],
  });
}

export async function getTareas(range?: ListDateRangeInput) {
  const session = await getCurrentUser();
  const tareaScopeWhere = await getTareaScopeWhere(session);
  const dateRange = resolveListDateRange(range);

  return prisma.tarea.findMany({
    where: { ...tareaScopeWhere, fechaObjetivo: { gte: dateRange.from, lt: dateRange.toExclusive } },
    include: {
      nota: { include: { cliente: { select: { nombre: true, apellido: true, ciudad: true, numero: true } } } },
      usuario: { select: { id: true, usuario: true, nombre: true } },
    },
    orderBy: [{ usuario: { usuario: "asc" } }, { fechaObjetivo: "asc" }],
  });
}

export async function getTareaById(id: string) {
  const session = await getCurrentUser();
  const tareaScopeWhere = await getTareaScopeWhere(session);

  return prisma.tarea.findFirst({
    where: { id, ...tareaScopeWhere },
    include: { nota: { select: { clienteId: true } } },
  });
}

async function assertNotaInScope(notaId: string) {
  const { scopedUserIds } = await getScopedIdsForCurrentUser();
  const nota = await prisma.nota.findFirst({
    where: { id: notaId, cliente: { usuarioAsignadoId: { in: scopedUserIds } } },
    select: { id: true },
  });
  if (!nota) throw new Error("No tienes acceso a la nota seleccionada");
}

export async function createTarea(data: Tarea) {
  const session = await getCurrentUser();
  await assertNotaInScope(data.notaId);

  const nota = await prisma.nota.findFirst({
    where: { id: data.notaId },
    select: { clienteId: true },
  });

  await prisma.tarea.create({ data: { ...data, usuarioId: session.IdUser } });
  revalidatePath("/tareas");
  if (nota?.clienteId) revalidatePath(`/clientes/${nota.clienteId}/profile`);
}

export async function updateTarea(data: Tarea) {
  if (!data.id) throw new Error("ID requerido");
  const session = await getCurrentUser();
  const tareaScopeWhere = await getTareaScopeWhere(session);
  const tarea = await prisma.tarea.findFirst({ where: { id: data.id, ...tareaScopeWhere }, select: { id: true } });
  if (!tarea) throw new Error("Tarea no encontrada");
  await assertNotaInScope(data.notaId);

  await prisma.tarea.update({ where: { id: data.id }, data: { notaId: data.notaId, titulo: data.titulo, descripcion: data.descripcion, fechaObjetivo: data.fechaObjetivo, estado: data.estado } });
  revalidatePath("/tareas");
  const nota = await prisma.nota.findFirst({ where: { id: data.notaId }, select: { clienteId: true } });
  if (nota?.clienteId) revalidatePath(`/clientes/${nota.clienteId}/profile`);
}

export async function cambiarEstadoTarea(id: string, estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA") {
  const session = await getCurrentUser();
  const tareaScopeWhere = await getTareaScopeWhere(session);
  const tarea = await prisma.tarea.findFirst({ where: { id, ...tareaScopeWhere }, select: { id: true } });
  if (!tarea) throw new Error("Tarea no encontrada");
  await prisma.tarea.update({ where: { id }, data: { estado } });
  revalidatePath("/tareas");
}
