"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { asignarClientesAUsuario } from "../actions";

type UsuarioOpcion = { id: string; usuario: string };
type ClienteAsignacion = {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  ciudad: string;
  usuarioAsignadoId: string;
  usuarioAsignado: { id: string; usuario: string };
};

export function AsignacionesForm({ usuarios, clientes }: { usuarios: UsuarioOpcion[]; clientes: ClienteAsignacion[] }) {
  const router = useRouter();
  const [usuarioId, setUsuarioId] = useState(usuarios[0]?.id ?? "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientes, setSelectedClientes] = useState<string[]>(() => clientes.filter((cliente) => cliente.usuarioAsignadoId === usuarios[0]?.id).map((cliente) => cliente.id));
  const [isPending, startTransition] = useTransition();

  const usuarioSeleccionado = usuarios.find((usuario) => usuario.id === usuarioId);
  const filteredClientes = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return clientes.filter((cliente) => `${cliente.nombre} ${cliente.apellido} ${cliente.correo} ${cliente.ciudad} ${cliente.usuarioAsignado.usuario}`.toLowerCase().includes(term));
  }, [clientes, searchTerm]);

  function handleUsuarioChange(nextUsuarioId: string) {
    setUsuarioId(nextUsuarioId);
    setSelectedClientes(clientes.filter((cliente) => cliente.usuarioAsignadoId === nextUsuarioId).map((cliente) => cliente.id));
  }

  function toggleCliente(clienteId: string) {
    setSelectedClientes((current) => current.includes(clienteId) ? current.filter((id) => id !== clienteId) : [...current, clienteId]);
  }

  function handleSubmit() {
    startTransition(async () => {
      try {
        await asignarClientesAUsuario(usuarioId, selectedClientes);
        toast.success("Asignaciones actualizadas.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudieron guardar las asignaciones.");
      }
    });
  }

  return (
    <div className="space-y-6 rounded-xl border bg-card p-4 shadow-sm md:p-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(240px,360px)_1fr] lg:items-end">
        <div className="space-y-2">
          <Label>Usuario responsable</Label>
          <Select value={usuarioId} onValueChange={handleUsuarioChange}>
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Selecciona un usuario" />
            </SelectTrigger>
            <SelectContent>
              {usuarios.map((usuario) => (
                <SelectItem key={usuario.id} value={usuario.id}>{usuario.usuario}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Los clientes marcados quedarán asignados a este usuario.</p>
        </div>

        <div className="relative max-w-xl">
          <Input placeholder="Buscar por nombre, correo, ciudad o usuario actual..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-10" />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
        Seleccionados: <strong className="text-foreground">{selectedClientes.length}</strong> para <strong className="text-foreground">{usuarioSeleccionado?.usuario ?? "sin usuario"}</strong>. Si marcas un cliente que pertenece a otro usuario, se reasignará automáticamente al guardar.
      </div>

      <ScrollArea className="h-[520px] pr-3">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredClientes.map((cliente) => {
            const checked = selectedClientes.includes(cliente.id);
            const belongsToSelectedUser = cliente.usuarioAsignadoId === usuarioId;
            return (
              <Label key={cliente.id} htmlFor={cliente.id} className="flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-4 transition hover:bg-muted/50">
                <Checkbox id={cliente.id} checked={checked} onCheckedChange={() => toggleCliente(cliente.id)} className="mt-1" />
                <span className="min-w-0 space-y-1">
                  <span className="block truncate font-medium">{cliente.nombre} {cliente.apellido}</span>
                  <span className="block truncate text-xs text-muted-foreground">{cliente.correo}</span>
                  <span className="block text-xs text-muted-foreground">{cliente.ciudad}</span>
                  <span className={belongsToSelectedUser ? "block text-xs text-emerald-600" : "block text-xs text-amber-600"}>
                    Actual: {cliente.usuarioAsignado.usuario}
                  </span>
                </span>
              </Label>
            );
          })}
        </div>
      </ScrollArea>

      {filteredClientes.length === 0 && <p className="text-sm text-muted-foreground">No se encontraron clientes con ese criterio.</p>}

      <div className="flex justify-end border-t pt-5">
        <Button type="button" onClick={handleSubmit} disabled={isPending || !usuarioId}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : "Guardar asignaciones"}
        </Button>
      </div>
    </div>
  );
}
