"use server";

import { getSession } from "@/auth";
import { getScopedUserIds } from "@/lib/access-scope";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { Usuario } from "./schema";

async function requireSession() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida");
  return session;
}

function isSuperAdminRole(roleName?: string | null) {
  return roleName?.trim().toUpperCase() === "SUPER_ADMIN";
}

function generateTemporaryPassword() {
  return `${randomBytes(6).toString("base64url")}#${randomBytes(3).toString("hex")}A1`;
}

async function assertCanUseRole(roleId: string) {
  const session = await requireSession();
  const role = await prisma.rol.findUnique({ where: { id: roleId }, select: { nombre: true, activo: true } });
  if (!role || !role.activo) throw new Error("Rol inválido");

  if (isSuperAdminRole(role.nombre) && !isSuperAdminRole(session.Rol)) {
    throw new Error("Solo un SUPER_ADMIN puede asignar el rol SUPER_ADMIN");
  }

  return { session, role };
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
  if (!data.password?.trim()) throw new Error("La contraseña es requerida");
  const hashed = await bcrypt.hash(data.password.trim(), 10);
  const { session, role } = await assertCanUseRole(data.rol_id);

  let adminPadreId: string | null = null;
  const isSuper = session.Permiso?.includes("ver_todos_usuarios") ?? false;
  const isVendedor = role.nombre.trim().toLowerCase() === "vendedor";
  if (!isSuper) {
    if (!isVendedor) throw new Error("Solo puedes crear vendedores");
    adminPadreId = session.IdUser;
  } else if (isVendedor) {
    adminPadreId = session.IdUser;
  }

  const newUser = await prisma.usuarios.create({ data: { id: randomUUID(), usuario: data.usuario, rol_id: data.rol_id, email: data.email, contrasena: hashed, activo: true, DebeCambiarPassword: true, adminPadreId } });
  revalidatePath("/usuarios");
  revalidatePath("/usuarios/jerarquia");
  return { id: newUser.id, usuario: newUser.usuario, rol: "", email: newUser.email, nombre: newUser.nombre ?? "", fotoUrl: newUser.fotoUrl ?? "", telefono: newUser.telefono ?? "", ciudad: newUser.ciudad ?? "", direccion: newUser.direccion ?? "", rol_id: newUser.rol_id, activo: newUser.activo };
}

export async function updateUsuario(data: Usuario): Promise<Usuario> {
  const { session } = await assertCanUseRole(data.rol_id);
  if (!session.Permiso?.includes("editar_usuario")) throw new Error("No autorizado");

  const scopedIds = await getScopedUserIds(session);
  if (!data.id || !scopedIds.includes(data.id)) throw new Error("No autorizado");

  const updated = await prisma.usuarios.update({ where: { id: data.id }, data: { usuario: data.usuario, rol_id: data.rol_id, activo: data.activo, email: data.email } });
  revalidatePath("/usuarios");
  return { id: updated.id, usuario: updated.usuario, rol: "", rol_id: updated.rol_id, email: updated.email, nombre: updated.nombre ?? "", fotoUrl: updated.fotoUrl ?? "", telefono: updated.telefono ?? "", ciudad: updated.ciudad ?? "", direccion: updated.direccion ?? "", activo: updated.activo };
}

export async function resetUsuarioPassword(userId: string, manualPassword?: string): Promise<{ password: string }> {
  const session = await requireSession();
  if (!session.Permiso?.includes("editar_usuario")) throw new Error("No autorizado");

  const scopedIds = await getScopedUserIds(session);
  if (!scopedIds.includes(userId)) throw new Error("No autorizado");

  const password = manualPassword?.trim() || generateTemporaryPassword();
  if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");

  const hashed = await bcrypt.hash(password, 10);

  await prisma.usuarios.update({
    where: { id: userId },
    data: {
      contrasena: hashed,
      DebeCambiarPassword: true,
    },
  });

  revalidatePath("/usuarios");
  revalidatePath(`/usuarios/${userId}/edit`);
  return { password };
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

export async function reasignarVendedorAdministrador(vendedorId: string, adminDestinoId: string) {
  const session = await requireSession();
  if (!session.Permiso?.includes("super_admin")) throw new Error("No autorizado");
  if (vendedorId === adminDestinoId) throw new Error("El vendedor no puede asignarse a sí mismo");

  const [vendedor, adminDestino] = await Promise.all([
    prisma.usuarios.findFirst({
      where: { id: vendedorId, activo: true, rol: { nombre: "VENDEDOR" } },
      select: { id: true },
    }),
    prisma.usuarios.findFirst({
      where: { id: adminDestinoId, activo: true, rol: { nombre: { in: ["SUPER_ADMIN", "ADMINISTRADOR"] } } },
      select: { id: true },
    }),
  ]);

  if (!vendedor) throw new Error("Selecciona un vendedor activo válido");
  if (!adminDestino) throw new Error("Selecciona un super admin o administrador activo válido");

  await prisma.usuarios.update({
    where: { id: vendedorId },
    data: { adminPadreId: adminDestinoId },
  });

  revalidatePath("/usuarios");
  revalidatePath("/usuarios/jerarquia");
  return { ok: true };
}
