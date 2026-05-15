"use server";

import { prisma } from "@/lib/prisma";
import { EmailService, MailPayload } from "@/lib/sendEmail";
import { generateUserCreatedEmailHtml } from "@/lib/templates/createUserEmail";
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";
import { Usuario } from "./schema";

type CreateUsuarioResult = {
  usuario: Usuario;
  emailSent: boolean;
};

/**
 * Obtener todos los usuarios con rol y empleado
 */
export async function getUsuarios(): Promise<Usuario[]> {
  const records = await prisma.usuarios.findMany({
    include: {
      rol: { select: { id: true, nombre: true } },
    },
  });
  return records.map((r) => ({
    id: r.id,
    usuario: r.usuario,
    email: r.email,
    nombre: r.nombre ?? "",
    fotoUrl: r.fotoUrl ?? "",
    telefono: r.telefono ?? "",
    ciudad: r.ciudad ?? "",
    direccion: r.direccion ?? "",
    rol: r.rol?.nombre ?? "",
    rol_id: r.rol_id,
    activo: r.activo,
  }));
}

/**
 * Crear un nuevo usuario y enviar correo con contraseña temporal
 */
export async function createUsuario(data: Usuario): Promise<CreateUsuarioResult> {
  const tempPassword = data.password?.trim() || randomBytes(9).toString("base64").slice(0, 12);
  const hashed = await bcrypt.hash(tempPassword, 10);

  const newUser = await prisma.usuarios.create({
    data: {
      id: randomUUID(),
      usuario: data.usuario,
      rol_id: data.rol_id,
      email: data.email,
      contrasena: hashed,
      activo: true,
      DebeCambiarPassword: true,
    },
  });

  let emailSent = false;

  if (data.email) {
    const html = generateUserCreatedEmailHtml(`${data.usuario}`, data.usuario, tempPassword);

    const mailPayload: MailPayload = {
      to: data.email,
      subject: "Cuenta creada: contraseña temporal",
      html,
    };

    try {
      const emailService = new EmailService();
      await emailService.sendMail(mailPayload);
      emailSent = true;
    } catch (err) {
      console.error("Error enviando correo al usuario:", err);
    }
  }

  return {
    usuario: {
      id: newUser.id,
      usuario: newUser.usuario,
      rol: "",
      email: newUser.email,
      nombre: newUser.nombre ?? "",
      fotoUrl: newUser.fotoUrl ?? "",
      telefono: newUser.telefono ?? "",
      ciudad: newUser.ciudad ?? "",
      direccion: newUser.direccion ?? "",
      rol_id: newUser.rol_id,
      activo: newUser.activo,
    },
    emailSent,
  };
}

/**
 * Actualizar un usuario existente
 */
export async function updateUsuario(data: Usuario): Promise<Usuario> {
  const updated = await prisma.usuarios.update({
    where: { id: data.id },
    data: {
      usuario: data.usuario,
      rol_id: data.rol_id,
      activo: data.activo,
      email: data.email,
    },
  });
  return {
    id: updated.id,
    usuario: updated.usuario,
    rol: "",
    rol_id: updated.rol_id,
    email: updated.email,
    nombre: updated.nombre ?? "",
    fotoUrl: updated.fotoUrl ?? "",
    telefono: updated.telefono ?? "",
    ciudad: updated.ciudad ?? "",
    direccion: updated.direccion ?? "",
    activo: updated.activo,
  };
}

/**
 * Obtener usuario por ID
 */
export async function getUsuarioById(id: string): Promise<Usuario | null> {
  const r = await prisma.usuarios.findUnique({
    where: { id },
    include: {
      rol: { select: { nombre: true } },
    },
  });
  if (!r) return null;
  return {
    id: r.id,
    usuario: r.usuario,
    rol: r.rol?.nombre ?? "",
    rol_id: r.rol_id,
    email: r.email,
    nombre: r.nombre ?? "",
    fotoUrl: r.fotoUrl ?? "",
    telefono: r.telefono ?? "",
    ciudad: r.ciudad ?? "",
    direccion: r.direccion ?? "",
    activo: r.activo,
  };
}

export async function getUsuariosOpciones(): Promise<Array<{ id: string; usuario: string }>> {
  const records = await prisma.usuarios.findMany({
    select: { id: true, usuario: true },
    orderBy: { usuario: "asc" },
  });

  return records;
}
