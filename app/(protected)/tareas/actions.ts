"use server";
import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Tarea } from "./schema";

export async function getTareas() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para consultar tareas");

  const puedeVerTodas = session.Permiso?.includes("ver_todas_tareas") ?? false;

  return prisma.tarea.findMany({
    where: puedeVerTodas ? undefined : { asignadoAId: session.IdUser },
    include: {
      asignadoA: { select: { usuario: true } },
      asignadoPor: { select: { usuario: true } },
      productosObjetivo: { include: { producto: { select: { id: true, nombre: true, precio: true } } } },
    },
    orderBy: { createAt: "desc" },
  });
}

export async function getTareaById(id: string) {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para consultar tareas");

  const puedeVerTodas = session.Permiso?.includes("ver_todas_tareas") ?? false;

  return prisma.tarea.findFirst({
    where: { id, ...(puedeVerTodas ? {} : { asignadoAId: session.IdUser }) },
    include: { productosObjetivo: { include: { producto: { select: { id: true, nombre: true, precio: true } } } } },
  });
}

function tareaProductosData(productosObjetivo: Tarea["productosObjetivo"]) {
  return productosObjetivo.map((item) => ({ productoId: item.productoId, cantidadObjetivo: item.cantidadObjetivo }));
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
      productosObjetivo: { create: tareaProductosData(data.productosObjetivo) },
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
    await tx.tareaProducto.deleteMany({ where: { tareaId: data.id } });
    return tx.tarea.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        estado: data.estado,
        fechaFinalizacion: data.fechaFinalizacion,
        asignadoAId: data.asignadoAId,
        asignadoPorId: data.asignadoPorId,
        productosObjetivo: { create: tareaProductosData(data.productosObjetivo) },
      },
    });
  });

  revalidatePath("/tareas");
  return tarea;
}
