"use client";
import { Button } from "@/components/ui/button";
import { formatHondurasInputDate } from "@/lib/date-format";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createTarea, getNotasOpcionesByCliente, updateTarea } from "../actions";
import { TareaFormValues, TareaSchema } from "../schema";

type TareaFormOutput = z.output<typeof TareaSchema>;
type ClienteOption = { id: string; nombre: string; apellido: string };
type NotaOption = { id: string; contenido: string; clienteId: string; cliente: { nombre: string; apellido: string } };
type TareaInitialData = Partial<TareaFormOutput> & { clienteId?: string };

export function Formulario({ clientes, notasIniciales = [], initialData, isUpdate = false }: { clientes: ClienteOption[]; notasIniciales?: NotaOption[]; initialData?: TareaInitialData; isUpdate?: boolean }) {
  const router = useRouter();
  const [clienteId, setClienteId] = useState(initialData?.clienteId ?? "");
  const [notas, setNotas] = useState<NotaOption[]>(notasIniciales);
  const [isPending, startTransition] = useTransition();
  const form = useForm<TareaFormValues, unknown, TareaFormOutput>({
    resolver: zodResolver(TareaSchema),
    defaultValues: {
      id: initialData?.id,
      notaId: initialData?.notaId ?? "",
      titulo: initialData?.titulo ?? "",
      descripcion: initialData?.descripcion ?? "",
      fechaObjetivo: initialData?.fechaObjetivo ?? new Date(),
      estado: initialData?.estado ?? "PENDIENTE",
    },
  });

  useEffect(() => {
    if (!clienteId) return;

    startTransition(async () => {
      try {
        const notasCliente = await getNotasOpcionesByCliente(clienteId);
        setNotas(notasCliente);
        if (!notasCliente.some((nota) => nota.id === form.getValues("notaId"))) {
          form.setValue("notaId", "", { shouldValidate: true });
        }
      } catch (error) {
        setNotas([]);
        form.setValue("notaId", "", { shouldValidate: true });
        toast.error(error instanceof Error ? error.message : "Error al cargar notas");
      }
    });
  }, [clienteId, form]);

  function handleClienteChange(value: string) {
    setClienteId(value);
    setNotas([]);
    form.setValue("notaId", "", { shouldValidate: true });
  }

  async function onSubmit(data: TareaFormOutput) {
    try {
      if (isUpdate) await updateTarea(data);
      else await createTarea(data);
      toast.success(isUpdate ? "Tarea actualizada" : "Tarea creada");
      router.push("/tareas");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-card p-4 shadow-sm md:p-6">
    <Field>
      <FieldLabel>Cliente</FieldLabel>
      <FieldContent>
        <Select value={clienteId} onValueChange={handleClienteChange}>
          <SelectTrigger><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
          <SelectContent>{clientes.map((cliente) => <SelectItem key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.apellido}</SelectItem>)}</SelectContent>
        </Select>
      </FieldContent>
      <FieldDescription>Primero selecciona el cliente para cargar solo sus notas visibles.</FieldDescription>
    </Field>

    <Controller name="notaId" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Nota relacionada</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange} disabled={!clienteId || isPending}><SelectTrigger><SelectValue placeholder={isPending ? "Cargando notas..." : "Selecciona una nota"} /></SelectTrigger><SelectContent>{notas.map((n) => <SelectItem key={n.id} value={n.id}>{n.cliente.nombre} {n.cliente.apellido} - {n.contenido.slice(0, 40)}</SelectItem>)}</SelectContent></Select></FieldContent><FieldDescription>La tarea se amarra a una nota, y la nota al cliente.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="titulo" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Título</FieldLabel><FieldContent><Input {...field} value={field.value ?? ""} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="descripcion" control={form.control} render={({ field }) => <Field><FieldLabel>Descripción</FieldLabel><FieldContent><Textarea rows={4} {...field} value={field.value ?? ""} /></FieldContent></Field>} />
    <Controller name="fechaObjetivo" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Fecha de la tarea</FieldLabel><FieldContent><Input type="date" value={field.value ? formatHondurasInputDate(field.value as string | number | Date) : ""} onChange={(e) => field.onChange(new Date(`${e.target.value}T00:00:00`))} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="estado" control={form.control} render={({ field }) => <Field><FieldLabel>Estado</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PENDIENTE">Pendiente</SelectItem><SelectItem value="EN_PROGRESO">En progreso</SelectItem><SelectItem value="COMPLETADA">Completada</SelectItem></SelectContent></Select></FieldContent></Field>} />
    <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => router.push('/tareas')}>Cancelar</Button><Button type="submit">Guardar</Button></div>
  </form>;
}
