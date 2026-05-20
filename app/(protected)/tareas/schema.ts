import { z } from "zod";

export const TareaSchema = z.object({
  id: z.string().optional(),
  notaId: z.string().min(1, "Selecciona una nota"),
  titulo: z.string().min(1, "El título es requerido"),
  descripcion: z.string().optional(),
  fechaObjetivo: z.coerce.date(),
  estado: z.enum(["PENDIENTE", "EN_PROGRESO", "COMPLETADA"]).default("PENDIENTE"),
});

export type Tarea = z.output<typeof TareaSchema>;
export type TareaFormValues = z.input<typeof TareaSchema>;
