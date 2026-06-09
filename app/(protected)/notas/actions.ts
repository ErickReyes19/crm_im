"use server";

import { getSession } from "@/auth";
import { getScopedUserIds } from "@/lib/access-scope";
import { resolveListDateRange, type ListDateRangeInput } from "@/lib/list-date-range";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Nota } from "./schema";

async function getCurrentUser() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida");
  return session;
}

export async function getNotas(range?: ListDateRangeInput) {
  const session = await getCurrentUser();
  const scopedUserIds = await getScopedUserIds(session);
  const dateRange = resolveListDateRange(range);

  return prisma.nota.findMany({
    where: { cliente: { usuarioAsignadoId: { in: scopedUserIds } }, createAt: { gte: dateRange.from, lt: dateRange.toExclusive } },
    include: { cliente: { select: { id: true, nombre: true, apellido: true, ciudad: true, numero: true } }, usuario: { select: { id: true, usuario: true, nombre: true } }, evidencias: true },
    orderBy: { createAt: "desc" },
  });
}

export async function getNotasByClienteId(clienteId: string) {
  if (!clienteId) return [];

  const session = await getCurrentUser();
  const scopedUserIds = await getScopedUserIds(session);
  const cliente = await prisma.cliente.findFirst({
    where: { id: clienteId, usuarioAsignadoId: { in: scopedUserIds } },
    select: { id: true },
  });
  if (!cliente) return [];

  return prisma.nota.findMany({
    where: { clienteId, cliente: { usuarioAsignadoId: { in: scopedUserIds } } },
    include: {
      usuario: { select: { id: true, usuario: true, nombre: true } },
      evidencias: true,
    },
    orderBy: { createAt: "asc" },
  });
}

export async function getNotaById(id: string) {
  const session = await getCurrentUser();
  const scopedUserIds = await getScopedUserIds(session);

  return prisma.nota.findFirst({
    where: { id, cliente: { usuarioAsignadoId: { in: scopedUserIds } } },
    include: {
      evidencias: true,
      cliente: { select: { id: true, nombre: true, apellido: true } },
      usuario: { select: { id: true, usuario: true } },
    },
  });
}

export async function createNota(data: Nota) {
  const session = await getCurrentUser();
  const scopedUserIds = await getScopedUserIds(session);
  const cliente = await prisma.cliente.findFirst({ where: { id: data.clienteId, usuarioAsignadoId: { in: scopedUserIds } }, select: { id: true } });
  if (!cliente) throw new Error("No tienes acceso al cliente seleccionado");

  const nota = await prisma.nota.create({ data: { clienteId: data.clienteId, usuarioId: session.IdUser, contenido: data.contenido, evidencias: { create: (data.evidencias ?? []).map((evidencia) => ({ ubicacion: evidencia.ubicacion, nombre: evidencia.nombre })) } } });
  revalidatePath("/notas");
  revalidatePath(`/clientes/${data.clienteId}/profile`);
  return nota;
}

export async function updateNota(data: Nota) {
  if (!data.id) throw new Error("ID requerido");
  await getCurrentUser();
  const nota = await getNotaById(data.id);
  if (!nota) throw new Error("Nota no encontrada o sin acceso");

  await prisma.nota.update({ where: { id: data.id }, data: { contenido: data.contenido, evidencias: { deleteMany: {}, create: (data.evidencias ?? []).map((evidencia) => ({ ubicacion: evidencia.ubicacion, nombre: evidencia.nombre })) } } });
  revalidatePath("/notas");
}
