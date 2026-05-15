"use server";

import { prisma } from "@/lib/prisma";
import { Cliente } from "./schema";

export async function getClientes() {
  return prisma.cliente.findMany({
    include: { usuarioAsignado: { select: { id: true, usuario: true } } },
    orderBy: { createAt: "desc" },
  });
}

export async function getClienteById(id: string) {
  return prisma.cliente.findUnique({ where: { id } });
}

export async function createCliente(data: Cliente) {
  return prisma.cliente.create({
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      ciudad: data.ciudad,
      correo: data.correo,
      numero: data.numero,
      direccion: data.direccion,
      etiqueta: data.etiqueta,
      usuarioAsignadoId: data.usuarioAsignadoId,
      activo: true,
    },
  });
}

export async function updateCliente(data: Cliente) {
  if (!data.id) throw new Error("ID de cliente requerido");

  return prisma.cliente.update({
    where: { id: data.id },
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      ciudad: data.ciudad,
      correo: data.correo,
      numero: data.numero,
      direccion: data.direccion,
      etiqueta: data.etiqueta,
      usuarioAsignadoId: data.usuarioAsignadoId,
      activo: data.activo,
    },
  });
}

export async function transferirCliente(clienteId: string, usuarioAsignadoId: string) {
  return prisma.cliente.update({ where: { id: clienteId }, data: { usuarioAsignadoId } });
}


export async function getClientesOpciones() {
  return prisma.cliente.findMany({ select: { id: true, nombre: true, apellido: true }, where: { activo: true }, orderBy: { nombre: "asc" } });
}
