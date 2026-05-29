"use server";

import { getSession } from "@/auth";
import { getScopedUserIds } from "@/lib/access-scope";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { Usuario } from "./schema";

async function requireSession() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida");
  return session;
}

export async function getUsuarios(): Promise<Usuario[]> {
  const session = await requireSession();
  const scopedIds = await getScopedUserIds(session);
  const records = await prisma.usuarios.findMany({
    where: { id: { in: scopedIds } },
    include: { rol: { select: { id: true, nombre: true } } },
  });
  return records.map((r) => ({ id: r.id, usuario: r.usuario, email: r.email, nombre: r.nombre ?? "", fotoUrl: r.fotoUrl ?? "", telefono: r.telefono ?? "", ciudad: r.ciudad ?? "", direccion: r.direccion ?? "", rol: r.rol?.nombre ?? "", rol_id: r.rol_id, activo: r.activo }));
}

export async function createUsuario(data: Usuario): Promise<Usuario> {
  const session = await requireSession();
  if (!data.password?.trim()) throw new Error("La contraseña es requerida");
  const hashed = await bcrypt.hash(data.password.trim(), 10);

  const role = await prisma.rol.findUnique({ where: { id: data.rol_id }, select: { nombre: true } });
  if (!role) throw new Error("Rol inválido");

  let adminPadreId: string | null = null;
  const isSuper = session.Permiso?.includes("ver_todos_usuarios") ?? false;
  if (!isSuper) {
    if (role.nombre.toLowerCase() !== "vendedor") throw new Error("Solo puedes crear vendedores");
    adminPadreId = session.IdUser;
  }

  const newUser = await prisma.usuarios.create({ data: { id: randomUUID(), usuario: data.usuario, rol_id: data.rol_id, email: data.email, contrasena: hashed, activo: true, DebeCambiarPassword: false, adminPadreId } });
  revalidatePath("/usuarios");
  return { id: newUser.id, usuario: newUser.usuario, rol: "", email: newUser.email, nombre: newUser.nombre ?? "", fotoUrl: newUser.fotoUrl ?? "", telefono: newUser.telefono ?? "", ciudad: newUser.ciudad ?? "", direccion: newUser.direccion ?? "", rol_id: newUser.rol_id, activo: newUser.activo };
}

export async function updateUsuario(data: Usuario): Promise<Usuario> {
  const session = await requireSession();
  const scopedIds = await getScopedUserIds(session);
  if (!data.id || !scopedIds.includes(data.id)) throw new Error("No autorizado");

  const updated = await prisma.usuarios.update({ where: { id: data.id }, data: { usuario: data.usuario, rol_id: data.rol_id, activo: data.activo, email: data.email } });
  revalidatePath("/usuarios");
  return { id: updated.id, usuario: updated.usuario, rol: "", rol_id: updated.rol_id, email: updated.email, nombre: updated.nombre ?? "", fotoUrl: updated.fotoUrl ?? "", telefono: updated.telefono ?? "", ciudad: updated.ciudad ?? "", direccion: updated.direccion ?? "", activo: updated.activo };
}

export async function getUsuarioById(id: string): Promise<Usuario | null> {
  const session = await requireSession();
  const scopedIds = await getScopedUserIds(session);
  if (!scopedIds.includes(id)) return null;
  const r = await prisma.usuarios.findUnique({ where: { id }, include: { rol: { select: { nombre: true } } } });
  if (!r) return null;
  return { id: r.id, usuario: r.usuario, rol: r.rol?.nombre ?? "", rol_id: r.rol_id, email: r.email, nombre: r.nombre ?? "", fotoUrl: r.fotoUrl ?? "", telefono: r.telefono ?? "", ciudad: r.ciudad ?? "", direccion: r.direccion ?? "", activo: r.activo };
}

export async function getUsuariosOpciones(): Promise<Array<{ id: string; usuario: string }>> {
  const session = await requireSession();
  const scopedIds = await getScopedUserIds(session);
  return prisma.usuarios.findMany({ where: { id: { in: scopedIds } }, select: { id: true, usuario: true }, orderBy: { usuario: "asc" } });
}
