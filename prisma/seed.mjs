import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const PERMISSIONS = [
  ["super_admin", "Acceso total y administración global del CRM"],
  ["ver_dashboard", "Permite ver el panel principal"],
  ["acceso_kpi_usuarios", "Permite ver indicadores de usuarios"],
  ["ver_profile", "Permite ver el perfil propio"],
  ["ver_usuarios", "Permite listar usuarios"],
  ["crear_usuario", "Permite crear usuarios"],
  ["editar_usuario", "Permite editar usuarios"],
  ["ver_todos_usuarios", "Permite ver todos los usuarios"],
  ["gestionar_mi_equipo", "Permite gestionar usuarios del equipo propio"],
  ["ver_roles", "Permite listar roles"],
  ["crear_roles", "Permite crear roles"],
  ["editar_roles", "Permite editar roles"],
  ["ver_permisos", "Permite listar permisos"],
  ["crear_permisos", "Permite crear permisos"],
  ["editar_permisos", "Permite editar permisos"],
  ["ver_clientes", "Permite listar clientes"],
  ["crear_cliente", "Permite crear clientes"],
  ["editar_cliente", "Permite editar clientes"],
  ["ver_todos_clientes", "Permite ver todos los clientes"],
  ["asignar_clientes", "Permite asignar clientes a usuarios"],
  ["ver_productos", "Permite listar productos"],
  ["crear_producto", "Permite crear productos"],
  ["editar_producto", "Permite editar productos"],
  ["ver_ventas", "Permite listar ventas"],
  ["crear_venta", "Permite crear ventas"],
  ["editar_venta", "Permite editar ventas"],
  ["ver_todas_ventas", "Permite ver todas las ventas"],
  ["ver_notas", "Permite listar notas"],
  ["crear_notas", "Permite crear notas"],
  ["editar_notas", "Permite editar notas"],
  ["editar_nota", "Compatibilidad para editar una nota"],
  ["ver_tareas", "Permite listar tareas"],
  ["crear_tarea", "Permite crear tareas"],
  ["editar_tarea", "Permite editar tareas"],
  ["ver_online", "Permite ver usuarios conectados y su último inicio de sesión"],
];

const ROLE_DEFINITIONS = [
  {
    nombre: "SUPER_ADMIN",
    descripcion: "Rol base protegido con acceso total al sistema",
    permisos: PERMISSIONS.map(([nombre]) => nombre),
  },
  {
    nombre: "ADMINISTRADOR",
    descripcion: "Rol base protegido para administrar operaciones y equipo propio",
    permisos: [
      "ver_dashboard",
      "acceso_kpi_usuarios",
      "ver_profile",
      "ver_usuarios",
      "crear_usuario",
      "editar_usuario",
      "gestionar_mi_equipo",
      "ver_clientes",
      "crear_cliente",
      "editar_cliente",
      "ver_todos_clientes",
      "asignar_clientes",
      "ver_productos",
      "crear_producto",
      "editar_producto",
      "ver_ventas",
      "crear_venta",
      "editar_venta",
      "ver_todas_ventas",
      "ver_notas",
      "crear_notas",
      "editar_notas",
      "editar_nota",
      "ver_tareas",
      "crear_tarea",
      "editar_tarea",
      "ver_online",
    ],
  },
  {
    nombre: "VENDEDOR",
    descripcion: "Rol base protegido para ventas y seguimiento de clientes asignados",
    permisos: [
      "ver_dashboard",
      "ver_profile",
      "ver_clientes",
      "crear_cliente",
      "editar_cliente",
      "ver_productos",
      "ver_ventas",
      "crear_venta",
      "editar_venta",
      "ver_notas",
      "crear_notas",
      "editar_notas",
      "editar_nota",
      "ver_tareas",
      "crear_tarea",
      "editar_tarea",
    ],
  },
];

async function upsertPermission(nombre, descripcion) {
  return prisma.permiso.upsert({
    where: { nombre },
    update: { descripcion, activo: true },
    create: { id: randomUUID(), nombre, descripcion, activo: true },
  });
}

async function upsertRole(role, permissionByName) {
  const existing = await prisma.rol.findUnique({ where: { nombre: role.nombre } });
  const rol = existing
    ? await prisma.rol.update({
        where: { nombre: role.nombre },
        data: {
          descripcion: role.descripcion,
          activo: true,
          permisos: { deleteMany: {} },
        },
      })
    : await prisma.rol.create({
        data: {
          id: randomUUID(),
          nombre: role.nombre,
          descripcion: role.descripcion,
          activo: true,
        },
      });

  await prisma.rolPermiso.createMany({
    data: role.permisos.map((permissionName) => ({
      id: randomUUID(),
      rolId: rol.id,
      permisoId: permissionByName.get(permissionName).id,
    })),
    skipDuplicates: true,
  });

  return rol;
}

async function main() {
  const permissionByName = new Map();

  for (const [nombre, descripcion] of PERMISSIONS) {
    const permission = await upsertPermission(nombre, descripcion);
    permissionByName.set(nombre, permission);
  }

  const roles = new Map();
  for (const role of ROLE_DEFINITIONS) {
    roles.set(role.nombre, await upsertRole(role, permissionByName));
  }

  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD ?? "SuperAdmin123!";
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  await prisma.usuarios.upsert({
    where: { email: process.env.SUPER_ADMIN_EMAIL ?? "super_admin@importacionesmia.local" },
    update: {
      usuario: "super_admin",
      nombre: "Super Administrador",
      rol_id: roles.get("SUPER_ADMIN").id,
      activo: true,
      DebeCambiarPassword: false,
      adminPadreId: null,
    },
    create: {
      id: randomUUID(),
      usuario: "super_admin",
      nombre: "Super Administrador",
      email: process.env.SUPER_ADMIN_EMAIL ?? "super_admin@importacionesmia.local",
      contrasena: hashedPassword,
      rol_id: roles.get("SUPER_ADMIN").id,
      activo: true,
      DebeCambiarPassword: false,
    },
  });

  console.log("Seed completado: permisos, 3 roles base protegidos y usuario super_admin.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
