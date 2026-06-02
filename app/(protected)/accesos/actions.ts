"use server";

import { getSession } from "@/auth";
import { getHierarchyUserIds } from "@/lib/access-scope";
import { prisma } from "@/lib/prisma";

const ONLINE_WINDOW_HOURS = 6;

export type AccesoUsuario = {
  id: string;
  usuario: string;
  nombre: string | null;
  email: string;
  rol: string;
  estaOnline: boolean;
  ultimoInicioSesion: Date | null;
  ultimaActividad: Date | null;
};

export async function getAccesosUsuarios(): Promise<AccesoUsuario[]> {
  const session = await getSession();
  if (!session?.Permiso?.includes("ver_online")) throw new Error("No tienes permiso para ver accesos");

  const onlineSince = new Date(Date.now() - ONLINE_WINDOW_HOURS * 60 * 60 * 1000);
  const hierarchyUserIds = await getHierarchyUserIds(session.IdUser);
  const usuarios = await prisma.usuarios.findMany({
    where: { id: { in: hierarchyUserIds } },
    select: {
      id: true,
      usuario: true,
      nombre: true,
      email: true,
      estaOnline: true,
      ultimoInicioSesion: true,
      ultimaActividad: true,
      rol: { select: { nombre: true } },
    },
    orderBy: [{ estaOnline: "desc" }, { ultimoInicioSesion: "desc" }, { usuario: "asc" }],
  });

  return usuarios.map((usuario) => ({
    id: usuario.id,
    usuario: usuario.usuario,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol.nombre,
    estaOnline: Boolean(usuario.estaOnline && usuario.ultimaActividad && usuario.ultimaActividad >= onlineSince),
    ultimoInicioSesion: usuario.ultimoInicioSesion,
    ultimaActividad: usuario.ultimaActividad,
  }));
}
