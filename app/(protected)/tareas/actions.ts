"use server";
import { prisma } from "@/lib/prisma";
import { Tarea } from "./schema";

export async function getTareas() {
  return prisma.tarea.findMany({
    include: {
      asignadoA: { select: { usuario: true } },
      asignadoPor: { select: { usuario: true } },
    },
    orderBy: { createAt: "desc" },
  });
}

export async function getTareaById(id: string) {
  return prisma.tarea.findUnique({ where: { id } });
}

export async function createTarea(data: Tarea) {
  return prisma.tarea.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      estado: data.estado,
      fechaFinalizacion: data.fechaFinalizacion,
      asignadoAId: data.asignadoAId,
      asignadoPorId: data.asignadoPorId,
    },
  });
}

export async function updateTarea(data: Tarea) {
  if (!data.id) throw new Error("ID de tarea requerido");

  return prisma.tarea.update({
    where: { id: data.id },
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      estado: data.estado,
      fechaFinalizacion: data.fechaFinalizacion,
      asignadoAId: data.asignadoAId,
      asignadoPorId: data.asignadoPorId,
    },
  });
}
