import { z } from "zod";

export const ClienteSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  ciudad: z.string().min(1),
  correo: z.email(),
  numero: z.string().min(1),
  direccion: z.string().min(1),
  etiqueta: z.enum(["NUEVO", "INTERESADO"]),
  usuarioAsignadoId: z.string().min(1),
  activo: z.boolean().default(true),
});

export type Cliente = z.infer<typeof ClienteSchema>;
