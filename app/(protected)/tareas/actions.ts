"use server";
import { prisma } from "@/lib/prisma";
import { Tarea } from "./schema";
export async function getTareas() { return prisma.tarea.findMany({ include: { asignadoA: { select: { usuario: true } }, asignadoPor: { select: { usuario: true } } }, orderBy: { createAt: "desc" } }); }
export async function createTarea(data: Tarea) { return prisma.tarea.create({ data }); }
