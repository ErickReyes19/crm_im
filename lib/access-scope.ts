import { UsuarioSesion } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getScopedUserIds(session: UsuarioSesion): Promise<string[]> {
  if (session.Permiso?.includes("ver_todos_usuarios") || session.Permiso?.includes("super_admin")) {
    const all = await prisma.usuarios.findMany({ select: { id: true } });
    return all.map((u) => u.id);
  }

  if (session.Permiso?.includes("gestionar_mi_equipo")) {
    const team = await prisma.usuarios.findMany({
      where: { OR: [{ id: session.IdUser }, { adminPadreId: session.IdUser }] },
      select: { id: true },
    });
    return team.map((u) => u.id);
  }

  return [session.IdUser];
}

export async function canManageUser(session: UsuarioSesion, userId: string): Promise<boolean> {
  const ids = await getScopedUserIds(session);
  return ids.includes(userId);
}
