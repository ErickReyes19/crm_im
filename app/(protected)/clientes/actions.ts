"use server";
import { prisma } from "@/lib/prisma";
import { Cliente } from "./schema";

export async function getClientes() { return prisma.cliente.findMany({ include: { usuarioAsignado: {select:{id:true,usuario:true}} }, orderBy: { createAt: "desc" } }); }
export async function createCliente(data: Cliente) { return prisma.cliente.create({ data }); }
export async function transferirCliente(clienteId: string, usuarioAsignadoId: string) { return prisma.cliente.update({ where: { id: clienteId }, data: { usuarioAsignadoId } }); }
