"use server";
import { prisma } from "@/lib/prisma";
import { Venta } from "./schema";
export async function getVentas() { return prisma.venta.findMany({ include: { cliente: true, usuario: { select: { usuario: true } } }, orderBy: { createAt: "desc" } }); }
export async function createVenta(data: Venta) { return prisma.venta.create({ data: { ...data, total: data.total } }); }
