"use server";
import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Tarea } from "./schema";

const ESTADOS_TAREA = ["PENDIENTE", "COMPLETADA"] as const;
type EstadoTarea = (typeof ESTADOS_TAREA)[number];

function isEstadoTarea(value: string): value is EstadoTarea {
  return ESTADOS_TAREA.includes(value as EstadoTarea);
}

export async function getTareas() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para consultar tareas");

  const puedeVerTodas = session.Permiso?.includes("ver_todas_tareas") ?? false;

  return prisma.tarea.findMany({
    where: puedeVerTodas ? undefined : { asignadoAId: session.IdUser },
    include: { asignadoA: { select: { usuario: true } }, asignadoPor: { select: { usuario: true } }, cliente: { select: { nombre: true, apellido: true } }, nota: { select: { id: true } } },
    orderBy: { createAt: "desc" },
  });
}

export async function getTareaById(id: string) {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para consultar tareas");

  const puedeVerTodas = session.Permiso?.includes("ver_todas_tareas") ?? false;

  return prisma.tarea.findFirst({
    where: { id, ...(puedeVerTodas ? {} : { asignadoAId: session.IdUser }) },
    include: { cliente: { select: { nombre: true, apellido: true } }, nota: { select: { id: true } } },
  });
}

export async function createTarea(data: Tarea) {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para crear tareas");
  if (!session.Permiso?.includes("crear_tarea")) throw new Error("No tienes permiso para crear tareas");

  const tarea = await prisma.tarea.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      estado: data.estado,
      fechaFinalizacion: data.fechaFinalizacion,
      asignadoAId: data.asignadoAId,
      asignadoPorId: session.IdUser,
      clienteId: data.clienteId || null,
      notaId: data.notaId || null,
    },
  });

  revalidatePath("/tareas");
  return tarea;
}

export async function updateTarea(data: Tarea) {
  if (!data.id) throw new Error("ID de tarea requerido");

  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para actualizar tareas");
  if (!session.Permiso?.includes("editar_tarea")) throw new Error("No tienes permiso para editar tareas");

  const puedeVerTodas = session.Permiso?.includes("ver_todas_tareas") ?? false;
  const tareaAccesible = await prisma.tarea.findFirst({
    where: { id: data.id, ...(puedeVerTodas ? {} : { asignadoAId: session.IdUser }) },
    select: { id: true },
  });
  if (!tareaAccesible) throw new Error("No tienes acceso a esta tarea");

  const tarea = await prisma.$transaction(async (tx) => {
    return tx.tarea.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        estado: data.estado,
        fechaFinalizacion: data.fechaFinalizacion,
        asignadoAId: data.asignadoAId,
        asignadoPorId: data.asignadoPorId || session.IdUser,
        clienteId: data.clienteId || null,
        notaId: data.notaId || null,
      },
    });
  });

  revalidatePath("/tareas");
  return tarea;
}


export async function updateTareaEstado(id: string, estado: EstadoTarea) {
  if (!id) throw new Error("ID de tarea requerido");
  if (!isEstadoTarea(estado)) throw new Error("Estado de tarea inválido");

  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para actualizar tareas");

  const puedeVerTodas = session.Permiso?.includes("ver_todas_tareas") ?? false;
  const tareaAccesible = await prisma.tarea.findFirst({
    where: { id, ...(puedeVerTodas ? {} : { asignadoAId: session.IdUser }) },
    select: { id: true, asignadoAId: true },
  });

  if (!tareaAccesible) throw new Error("No tienes acceso a esta tarea");

  const puedeEditar = session.Permiso?.includes("editar_tarea") ?? false;
  const esAsignado = tareaAccesible.asignadoAId === session.IdUser;

  if (!puedeEditar && !esAsignado) {
    throw new Error("No tienes permiso para cambiar el estado de esta tarea");
  }

  const tarea = await prisma.tarea.update({
    where: { id },
    data: { estado },
  });

  revalidatePath("/tareas");
  return tarea;
}
