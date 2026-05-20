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
    include: {
      cliente: { select: { id: true, nombre: true, apellido: true } },
      usuario: { select: { id: true, usuario: true } },
    },
    orderBy: { createAt: "desc" },
  });
}

export async function createNota(data: Nota) {
  const session = await getCurrentUser();

  const cliente = await prisma.cliente.findFirst({
    where: {
      id: data.clienteId,
      ...(session.Permiso?.includes("ver_todos_clientes") ? {} : { usuarioAsignadoId: session.IdUser }),
    },
    select: { id: true },
  });

  if (!cliente) throw new Error("No tienes acceso al cliente seleccionado");

  const nota = await prisma.nota.create({
    data: {
      clienteId: data.clienteId,
      usuarioId: session.IdUser,
      contenido: data.contenido,
      evidencia: data.evidencia || null,
    },
  });

  revalidatePath("/notas");
  return nota;
}
