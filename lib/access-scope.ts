import { UsuarioSesion } from "@/auth";
import { prisma } from "@/lib/prisma";

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function isSuperAdminSession(session: UsuarioSesion): boolean {
  return normalizeRoleName(session.Rol) === "super_admin" || session.Permiso?.includes("super_admin") === true || session.Permiso?.includes("ver_todos_usuarios") === true;
}

export async function getScopedUserIds(session: UsuarioSesion): Promise<string[]> {
  if (isSuperAdminSession(session)) {
    const all = await prisma.usuarios.findMany({ select: { id: true } });
    return all.map((u) => u.id);
  }

  if (session.Permiso?.includes("gestionar_mi_equipo")) {
    return getHierarchyUserIds(session.IdUser);
  }

  return [session.IdUser];
}

export async function getHierarchyUserIds(rootUserId: string): Promise<string[]> {
  const scopedIds = new Set<string>([rootUserId]);
  let pendingIds = [rootUserId];

  while (pendingIds.length > 0) {
    const children = await prisma.usuarios.findMany({
      where: { adminPadreId: { in: pendingIds } },
      select: { id: true },
    });

    pendingIds = children
      .map((user) => user.id)
      .filter((id) => {
        if (scopedIds.has(id)) return false;
        scopedIds.add(id);
        return true;
      });
  }

  return [...scopedIds];
}

export async function canManageUser(session: UsuarioSesion, userId: string): Promise<boolean> {
  const ids = await getScopedUserIds(session);
  return ids.includes(userId);
}

export async function getScopedUsers(session: UsuarioSesion): Promise<Array<{ id: string; usuario: string; nombre: string | null; adminPadreId: string | null }>> {
  const scopedUserIds = await getScopedUserIds(session);

  return prisma.usuarios.findMany({
    where: { id: { in: scopedUserIds }, activo: true },
    select: { id: true, usuario: true, nombre: true, adminPadreId: true },
    orderBy: [{ nombre: "asc" }, { usuario: "asc" }],
  });
}

export function getUserDisplayName(usuario: { usuario: string; nombre?: string | null }) {
  return usuario.nombre?.trim() ? `${usuario.nombre} (${usuario.usuario})` : usuario.usuario;
}

export function getSessionDisplayName(session: UsuarioSesion) {
  return getUserDisplayName({ usuario: session.User, nombre: session.Nombre });
}
