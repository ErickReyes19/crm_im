"use client";
import { Button } from "@/components/ui/button";
import { formatHondurasInputDate } from "@/lib/date-format";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createTarea, getNotasOpcionesByCliente, updateTarea } from "../actions";
import { TareaFormValues, TareaSchema } from "../schema";

type TareaFormOutput = z.output<typeof TareaSchema>;
type TareaFormValuesWithUsuario = TareaFormValues & { usuarioId?: string };
type ClienteOption = { id: string; nombre: string; apellido: string; usuarioAsignadoId: string };
type UsuarioOption = { id: string; usuario: string; nombre?: string | null };
type NotaOption = { id: string; contenido: string; clienteId: string; cliente: { nombre: string; apellido: string } };
type TareaInitialData = Partial<TareaFormOutput> & { clienteId?: string };

export function Formulario({ clientes, usuarios, currentUserId, notasIniciales = [], initialData, isUpdate = false }: { clientes: ClienteOption[]; usuarios: UsuarioOption[]; currentUserId: string; notasIniciales?: NotaOption[]; initialData?: TareaInitialData; isUpdate?: boolean }) {
  const router = useRouter();
  const clienteInicial = clientes.find((cliente) => cliente.id === initialData?.clienteId);
  const defaultUsuarioId = clienteInicial?.usuarioAsignadoId ?? currentUserId ?? (usuarios.length === 1 ? usuarios[0].id : "");
  const [clienteId, setClienteId] = useState(initialData?.clienteId ?? "");
  const [notas, setNotas] = useState<NotaOption[]>(notasIniciales);
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<TareaFormValuesWithUsuario, unknown, TareaFormOutput>({
    resolver: zodResolver(TareaSchema),
    defaultValues: {
      id: initialData?.id,
      usuarioId: defaultUsuarioId,
      notaId: initialData?.notaId ?? "",
      titulo: initialData?.titulo ?? "",
      descripcion: initialData?.descripcion ?? "",
      fechaObjetivo: initialData?.fechaObjetivo ?? new Date(),
      estado: initialData?.estado ?? "PENDIENTE",
    },
  });

  const showUsuarioSelect = usuarios.length > 1;
  const selectedUsuarioId = useWatch({ control: form.control, name: "usuarioId" }) ?? defaultUsuarioId;
  const clientesFiltrados = selectedUsuarioId ? clientes.filter((cliente) => cliente.usuarioAsignadoId === selectedUsuarioId) : [];

  useEffect(() => {
    if (!selectedUsuarioId || !clienteId) return;
    const currentCliente = clientes.find((cliente) => cliente.id === clienteId);
    if (currentCliente?.usuarioAsignadoId !== selectedUsuarioId) {
      setClienteId("");
      setNotas([]);
      form.setValue("notaId", "", { shouldValidate: true });
    }
  }, [selectedUsuarioId, clienteId, clientes, form]);

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
    if (isSaving) return;

    setIsSaving(true);
    try {
      if (isUpdate) await updateTarea(data);
      else await createTarea(data);
      toast.success(isUpdate ? "Tarea actualizada" : "Tarea creada");
      router.push("/tareas");
      router.refresh();
    } catch (error) {
      setIsSaving(false);
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-card p-4 shadow-sm md:p-6">
    {showUsuarioSelect && (
      <Controller name="usuarioId" control={form.control} render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>Usuario</FieldLabel>
          <FieldContent>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                setClienteId("");
                setNotas([]);
                form.setValue("notaId", "", { shouldValidate: true });
              }}
              disabled={isUpdate || usuarios.length === 0}
            >
              <SelectTrigger><SelectValue placeholder="Selecciona usuario" /></SelectTrigger>
              <SelectContent>
                {usuarios.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id}>{usuario.nombre?.trim() ? `${usuario.nombre} (${usuario.usuario})` : usuario.usuario}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )} />
    )}

    <Field>
      <FieldLabel>Cliente</FieldLabel>
      <FieldContent>
        <Select value={clienteId} onValueChange={handleClienteChange} disabled={isUpdate || (usuarios.length > 1 && !selectedUsuarioId) || clientesFiltrados.length === 0}>
          <SelectTrigger><SelectValue placeholder={usuarios.length > 1 && !selectedUsuarioId ? "Selecciona usuario primero" : clientesFiltrados.length === 0 ? "No hay clientes con notas" : "Selecciona un cliente"} /></SelectTrigger>
          <SelectContent>{clientesFiltrados.map((cliente) => <SelectItem key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.apellido}</SelectItem>)}</SelectContent>
        </Select>
      </FieldContent>
      <FieldDescription>Primero selecciona el cliente para cargar solo sus notas visibles.</FieldDescription>
    </Field>

    <Controller name="notaId" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Nota relacionada</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange} disabled={!clienteId || isPending}><SelectTrigger><SelectValue placeholder={isPending ? "Cargando notas..." : "Selecciona una nota"} /></SelectTrigger><SelectContent>{notas.map((n) => <SelectItem key={n.id} value={n.id}>{n.cliente.nombre} {n.cliente.apellido} - {n.contenido.slice(0, 40)}</SelectItem>)}</SelectContent></Select></FieldContent><FieldDescription>La tarea se amarra a una nota, y la nota al cliente.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="titulo" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Título</FieldLabel><FieldContent><Input {...field} value={field.value ?? ""} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="descripcion" control={form.control} render={({ field }) => <Field><FieldLabel>Descripción</FieldLabel><FieldContent><Textarea rows={4} {...field} value={field.value ?? ""} /></FieldContent></Field>} />
    <Controller name="fechaObjetivo" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Fecha de la tarea</FieldLabel><FieldContent><Input type="date" value={field.value ? formatHondurasInputDate(field.value as string | number | Date) : ""} onChange={(e) => field.onChange(new Date(`${e.target.value}T00:00:00`))} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="estado" control={form.control} render={({ field }) => <Field><FieldLabel>Estado</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PENDIENTE">Pendiente</SelectItem><SelectItem value="EN_PROGRESO">En progreso</SelectItem><SelectItem value="COMPLETADA">Completada</SelectItem></SelectContent></Select></FieldContent></Field>} />
    <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => router.push('/tareas')}>Cancelar</Button><Button type="submit" disabled={isSaving || form.formState.isSubmitting}>{isSaving || form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUpdate ? "Actualizar" : "Crear"}</Button></div>
  </form>;
}
