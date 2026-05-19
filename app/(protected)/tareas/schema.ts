import { z } from "zod";

export const TareaSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, "El nombre es requerido").default("Seguimiento"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  estado: z.enum(["PENDIENTE", "COMPLETADA"]),
  fechaFinalizacion: z.coerce.date(),
  asignadoAId: z.string().min(1, "Selecciona el usuario asignado"),
  asignadoPorId: z.string().optional(),
  clienteId: z.string().optional(),
  notaId: z.string().optional(),
});

export type Tarea = z.output<typeof TareaSchema>;
export type TareaFormValues = z.input<typeof TareaSchema>;
