/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies, headers } from "next/headers";
import { prisma } from './lib/prisma';
import { Prisma } from "./lib/generated/prisma";

import {
  TSchemaResetPassword,
  schemaResetPassword,
} from "@/app/(public)/reset-password/schema";

import { schemaSignIn, TSchemaSignIn } from "@/lib/shemas";

// ------------------------------
// JWT CONFIG
// ------------------------------
const key = new TextEncoder().encode(process.env.AUTH_SECRET!);

export interface UsuarioSesion extends JWTPayload {
  IdUser: string;
  User: string;
  Nombre?: string | null;
  FotoUrl?: string | null;
  Rol: string;
  IdRol: string;
  Permiso: string[];
  DebeCambiar: boolean;
}

// ------------------------------
// JWT
// ------------------------------
export async function encrypt(payload: UsuarioSesion) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("6h")
    .sign(key);
}

export const decrypt = async (
  token: string
): Promise<UsuarioSesion | null> => {
  try {
    const { payload } = await jwtVerify<JWTPayload>(token, key, {
      algorithms: ["HS256"],
    });

    return {
      IdUser: payload.IdUser as string,
      User: payload.User as string,
      Rol: payload.Rol as string,
      Nombre: payload.Nombre as string | null,
      FotoUrl: payload.FotoUrl as string | null,
      IdRol: payload.IdRol as string,
      Permiso: (payload.Permiso as string[]) || [],
      DebeCambiar:
        payload.DebeCambiar === true || payload.DebeCambiar === "True",
      iss: payload.iss as string,
      aud: payload.aud as string,
    };
  } catch (err: any) {
    console.error(
      "JWT error:",
      err.name === "JWTExpired" ? "Token expirado" : err
    );
    return null;
  }
};

// ------------------------------
// COOKIE HELPERS
// ------------------------------
const setSessionCookie = async (token: string) => {
  const cookieStore = await cookies();

  cookieStore.set("session", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 6 * 60 * 60 * 1000),
  });
};

// ------------------------------
// SESSION
// ------------------------------
export const getSession = async (): Promise<UsuarioSesion | null> => {
  const headerStore = await headers();

  const isApiRequest = headerStore.get("x-api-request") === "1";

  const authHeader = headerStore.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (isApiRequest) {
    return bearerToken ? decrypt(bearerToken) : null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value || bearerToken;

  return token ? decrypt(token) : null;
};

// ------------------------------
export const getSessionPermisos = async () => {
  const session = await getSession();
  return session?.Permiso ?? null;
};

// ------------------------------
export const signOut = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await decrypt(token) : null;

  if (session?.IdUser) {
    await prisma.usuarios.update({
      where: { id: session.IdUser },
      data: { estaOnline: false, ultimaActividad: new Date() },
    }).catch((err) => console.error("signOut status error:", err));
  }

  cookieStore.delete("session");
};

// ------------------------------
// LOGIN
// ------------------------------
export const login = async (
  credentials: TSchemaSignIn,
  redirect: string
) => {
  const parsed = schemaSignIn.safeParse(credentials);

  if (!parsed.success) {
    return { error: "Usuario o contraseña inválidos" };
  }

  const { usuario, contrasena } = parsed.data;

  const authResult = await authenticateDB(usuario, contrasena);

  if (!authResult) {
    return { error: "Usuario o contraseña inválidos" };
  }

  await setSessionCookie(authResult.token);

  return {
    success: "Login OK",
    redirect: authResult.debeCambiar
      ? "/reset-password"
      : authResult.tareasHoy > 0
        ? "/tareas"
        : redirect,
    tareasHoy: authResult.debeCambiar ? 0 : authResult.tareasHoy,
  };
};

// ------------------------------
// RESET PASSWORD
// ------------------------------
export const resetPassword = async (
  credentials: TSchemaResetPassword,
  username: string
) => {
  const parsed = schemaResetPassword.safeParse(credentials);

  if (!parsed.success) {
    return { error: "Error al cambiar la contraseña" };
  }

  const token = await changePassword(username, parsed.data.confirmar);

  if (!token) {
    return { error: "Error al cambiar la contraseña" };
  }

  await setSessionCookie(token);

  return { success: "Contraseña cambiada con éxito" };
};

// ------------------------------
// PRISMA QUERY CONFIG
// ------------------------------
const usuarioWithRolArgs =
  Prisma.validator<Prisma.UsuariosDefaultArgs>()({
    include: {
      rol: {
        include: {
          permisos: { include: { permiso: true } },
        },
      },
    },
  });

// ------------------------------
// DB AUTH
// ------------------------------
async function authenticateDB(username: string, password: string) {
  try {
    const user = await prisma.usuarios.findFirst({
      where: { usuario: username },
      include: usuarioWithRolArgs.include,
    });

    if (!user) return null;

    const valid = await bcrypt.compare(password, user.contrasena);

    if (!valid) return null;

    const permisos = user.rol.permisos.map(
      (rp) => rp.permiso.nombre
    );

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const tareasHoy = await prisma.tarea.count({
      where: {
        usuarioId: user.id,
        estado: { not: "COMPLETADA" },
        fechaObjetivo: { gte: startOfToday, lt: startOfTomorrow },
      },
    });

    await prisma.usuarios.update({
      where: { id: user.id },
      data: { ultimoInicioSesion: now, ultimaActividad: now, estaOnline: true },
    });

    const payload: UsuarioSesion = {
      IdUser: user.id,
      User: user.usuario,
      Rol: user.rol.nombre,
      Nombre: user.nombre,
      FotoUrl: user.fotoUrl,
      IdRol: user.rol_id,
      Permiso: permisos,
      DebeCambiar: user.DebeCambiarPassword ?? false,
      iss: "your-issuer",
      aud: "your-audience",
    };

    return {
      token: await encrypt(payload),
      debeCambiar: payload.DebeCambiar,
      tareasHoy,
    };
  } catch (err) {
    console.error("authenticateDB error:", err);
    return null;
  }
}

// ------------------------------
// CHANGE PASSWORD
// ------------------------------
async function changePassword(username: string, newPassword: string) {
  try {
    const user = await prisma.usuarios.findFirst({
      where: { usuario: username },
      include: usuarioWithRolArgs.include,
    });

    if (!user) return null;

    const hashed = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.usuarios.update({
      where: { id: user.id },
      data: {
        contrasena: hashed,
        DebeCambiarPassword: false,
      },
      include: usuarioWithRolArgs.include,
    });

    const permisos = updated.rol.permisos.map(
      (rp) => rp.permiso.nombre
    );

    const payload: UsuarioSesion = {
      IdUser: updated.id,
      User: updated.usuario,
      Rol: updated.rol.nombre,
      Nombre: updated.nombre,
      FotoUrl: updated.fotoUrl,
      IdRol: updated.rol_id,
      Permiso: permisos,
      DebeCambiar: false,
      iss: "your-issuer",
      aud: "your-audience",
    };

    return encrypt(payload);
  } catch (err) {
    console.error("changePassword error:", err);
    return null;
  }
}