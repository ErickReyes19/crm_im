"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createCliente, updateCliente } from "../actions";
import { Cliente, ClienteSchema } from "../schema";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Formulario({ isUpdate, initialData, usuarios }: { isUpdate: boolean; initialData?: z.infer<typeof ClienteSchema>; usuarios: Array<{ id: string; usuario: string }>; }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof ClienteSchema>>({ resolver: zodResolver(ClienteSchema), defaultValues: initialData });

  async function onSubmit(data: z.infer<typeof ClienteSchema>) {
    try {
      if (isUpdate) {
        await updateCliente(data as Cliente);
        toast.success("Cliente actualizado.");
      } else {
        await createCliente(data as Cliente);
        toast.success("Cliente creado.");
      }
      router.push("/clientes");
      router.refresh();
    } catch {
      toast.error("Hubo un problema al guardar.");
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border rounded-md p-4">
    {(["nombre", "apellido", "ciudad", "correo", "numero", "direccion"] as const).map((n) => <Controller key={n} name={n} control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel className="capitalize">{n}</FieldLabel><FieldContent><Input {...field} value={field.value ?? ""} />
    </FieldContent><FieldDescription>Ingresa {n} del cliente.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />)}
    <Controller name="etiqueta" control={form.control} render={({ field }) => <Field><FieldLabel>Etiqueta</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Selecciona etiqueta" /></SelectTrigger><SelectContent><SelectItem value="NUEVO">Nuevo</SelectItem><SelectItem value="INTERESADO">Interesado</SelectItem></SelectContent></Select></FieldContent></Field>} />
    <Controller name="usuarioAsignadoId" control={form.control} render={({ field }) => <Field><FieldLabel>Usuario asignado</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Selecciona usuario" /></SelectTrigger><SelectContent>{usuarios.map((u) => <SelectItem key={u.id} value={u.id}>{u.usuario}</SelectItem>)}</SelectContent></Select></FieldContent></Field>} />
    {isUpdate && <Controller name="activo" control={form.control} render={({ field }) => <Field><FieldLabel>Estado</FieldLabel><FieldContent><Select value={field.value ? "true" : "false"} onValueChange={(v) => field.onChange(v === "true")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">Activo</SelectItem><SelectItem value="false">Inactivo</SelectItem></SelectContent></Select></FieldContent></Field>} />}
    <div className="flex justify-end"><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUpdate ? "Actualizar" : "Crear"}</Button></div>
  </form>;
}
