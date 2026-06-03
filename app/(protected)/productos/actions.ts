"use server";

import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Producto } from "./schema";

function assertPermiso(permisos: string[] | undefined, permiso: string) {
  if (!permisos?.includes(permiso)) throw new Error("No tienes permiso para realizar esta acción");
}

export async function getProductos() {
  return prisma.producto.findMany({
    include: { creadoPor: { select: { usuario: true } } },
    orderBy: { createAt: "desc" },
  });
}

export async function getProductoById(id?: string) {
  if (!id) return null;
  return prisma.producto.findUnique({ where: { id } });
}

export async function getProductosOpciones() {
  return prisma.producto.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, descripcion: true },
    orderBy: { nombre: "asc" },
  });
}

export async function createProducto(data: Producto) {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para crear productos");
  assertPermiso(session.Permiso, "crear_producto");

  const producto = await prisma.producto.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      activo: data.activo,
      creadoPorId: session.IdUser,
    },
  });

  revalidatePath("/productos");
  return producto;
}

export async function updateProducto(data: Producto) {
  if (!data.id) throw new Error("ID de producto requerido");

  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida para editar productos");
  assertPermiso(session.Permiso, "editar_producto");

  const producto = await prisma.producto.update({
    where: { id: data.id },
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      activo: data.activo,
    },
  });

  revalidatePath("/productos");
  return producto;
}
