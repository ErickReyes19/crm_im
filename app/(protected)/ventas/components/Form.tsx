"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createVenta, updateVenta } from "../actions";
import { Venta, VentaSchema } from "../schema";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Formulario({ isUpdate, initialData, clientes, usuarios }: { isUpdate: boolean; initialData?: z.infer<typeof VentaSchema>; clientes: Array<{ id: string; nombre: string; apellido: string }>; usuarios: Array<{ id: string; usuario: string }>; }) {
const router=useRouter(); const form=useForm<z.infer<typeof VentaSchema>>({resolver:zodResolver(VentaSchema),defaultValues:initialData});
async function onSubmit(data: z.infer<typeof VentaSchema>){ try{ if(isUpdate){ await updateVenta(data as Venta); toast.success("Venta actualizada."); } else { await createVenta(data as Venta); toast.success("Venta creada."); } router.push('/ventas'); router.refresh(); } catch { toast.error('Error al guardar.'); } }
return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border rounded-md p-4">
<Controller name="clienteId" control={form.control} render={({field})=><Field><FieldLabel>Cliente</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{clientes.map(c=><SelectItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</SelectItem>)}</SelectContent></Select></FieldContent></Field>} />
<Controller name="usuarioId" control={form.control} render={({field})=><Field><FieldLabel>Usuario</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{usuarios.map(u=><SelectItem key={u.id} value={u.id}>{u.usuario}</SelectItem>)}</SelectContent></Select></FieldContent></Field>} />
<Controller name="total" control={form.control} render={({field,fieldState})=><Field data-invalid={fieldState.invalid}><FieldLabel>Total</FieldLabel><FieldContent><Input type="number" step="0.01" {...field} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
<Controller name="estado" control={form.control} render={({field})=><Field><FieldLabel>Estado</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="PROCESO">Proceso</SelectItem><SelectItem value="ENVIO">Envío</SelectItem><SelectItem value="ENTREGADA">Entregada</SelectItem></SelectContent></Select></FieldContent></Field>} />
<div className="flex justify-end"><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUpdate ? 'Actualizar' : 'Crear'}</Button></div></form>; }
