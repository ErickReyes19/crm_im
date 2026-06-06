"use client";

import { reasignarVendedorAdministrador } from "@/app/(protected)/usuarios/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type UsuarioOpcion = {
  id: string;
  usuario: string;
  nombre: string | null;
  adminPadreId?: string | null;
};

function getUsuarioLabel(usuario: UsuarioOpcion) {
  return usuario.nombre?.trim() ? `${usuario.nombre} (@${usuario.usuario})` : `@${usuario.usuario}`;
}

export function ReasignarVendedorForm({ vendedores, admins }: { vendedores: UsuarioOpcion[]; admins: UsuarioOpcion[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [vendedorId, setVendedorId] = useState(vendedores[0]?.id ?? "");
  const [adminDestinoId, setAdminDestinoId] = useState(vendedores[0]?.adminPadreId ?? admins[0]?.id ?? "");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!vendedorId || !adminDestinoId) {
      toast.error("Selecciona un vendedor y un administrador destino.");
      return;
    }

    startTransition(async () => {
      try {
        await reasignarVendedorAdministrador(vendedorId, adminDestinoId);
        toast.success("Vendedor reasignado correctamente.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo reasignar el vendedor.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_auto] lg:items-end">
      <Field>
        <FieldLabel>Vendedor</FieldLabel>
        <FieldContent>
          <Select value={vendedorId} onValueChange={(value) => {
            setVendedorId(value);
            const vendedor = vendedores.find((item) => item.id === value);
            setAdminDestinoId(vendedor?.adminPadreId ?? admins[0]?.id ?? "");
          }} disabled={vendedores.length === 0 || isPending}>
            <SelectTrigger><SelectValue placeholder="Selecciona vendedor" /></SelectTrigger>
            <SelectContent>{vendedores.map((vendedor) => <SelectItem key={vendedor.id} value={vendedor.id}>{getUsuarioLabel(vendedor)}</SelectItem>)}</SelectContent>
          </Select>
        </FieldContent>
        <FieldDescription>Solo se muestran usuarios con rol vendedor.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel>Administrador destino</FieldLabel>
        <FieldContent>
          <Select value={adminDestinoId} onValueChange={setAdminDestinoId} disabled={admins.length === 0 || isPending}>
            <SelectTrigger><SelectValue placeholder="Selecciona administrador" /></SelectTrigger>
            <SelectContent>{admins.map((admin) => <SelectItem key={admin.id} value={admin.id}>{getUsuarioLabel(admin)}</SelectItem>)}</SelectContent>
          </Select>
        </FieldContent>
        <FieldDescription>Puede ser un super admin o administrador.</FieldDescription>
      </Field>

      <Button type="submit" disabled={isPending || vendedores.length === 0 || admins.length === 0}>
        {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Moviendo...</> : "Mover vendedor"}
      </Button>
    </form>
  );
}
