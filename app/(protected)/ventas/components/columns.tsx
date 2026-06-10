"use client";

import { getProductoLabel } from "@/app/(protected)/productos/schema";
import { cambiarEstadoVenta } from "@/app/(protected)/ventas/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Loader2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

function formatHnl(value: number) {
  return Number(value).toLocaleString("es-DO", { style: "currency", currency: "HNL" });
}

export type EstadoVenta = "PROCESO" | "ENVIO" | "ENTREGADA";

export const estadosVenta: Array<{ value: EstadoVenta; label: string }> = [
  { value: "PROCESO", label: "Proceso" },
  { value: "ENVIO", label: "Envío" },
  { value: "ENTREGADA", label: "Entregada" },
];

export type VentaTableRow = {
  id?: string;
  clienteId: string;
  total?: number;
  estado: EstadoVenta;
  metodoPago?: "EFECTIVO" | "TRANSFERENCIA";
  tipoDocumento?: "RECIBO" | "FACTURA";
  isv?: number;
  conEnvio?: boolean;
  envio?: number;
  canEditEstado?: boolean;
  cliente?: { nombre: string; apellido: string; ciudad?: string; numero?: string } | null;
  usuario?: { id: string; usuario: string; nombre: string | null } | null;
  usuarioFiltro: string;
  productos?: Array<{ cantidad: number; subtotal: number; producto?: { nombre: string; descripcion?: string } | null }>;
};

function CambiarEstadoActions({ venta }: { venta: VentaTableRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChangeEstado(estado: EstadoVenta) {
    if (!venta.id || estado === venta.estado) return;

    startTransition(async () => {
      try {
        await cambiarEstadoVenta(venta.id!, estado);
        toast.success("Estado de venta actualizado.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo cambiar el estado.");
      }
    });
  }

  if (!venta.canEditEstado) return null;

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger disabled={isPending}>{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Cambiar estado</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          {estadosVenta.map((estado) => (
            <DropdownMenuItem key={estado.value} disabled={isPending || venta.estado === estado.value} onSelect={() => handleChangeEstado(estado.value)}>
              {estado.label}{venta.estado === estado.value ? " (actual)" : ""}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  );
}

export const columns: ColumnDef<VentaTableRow>[] = [
  {
    id: "cliente",
    accessorFn: (venta) => `${venta.cliente?.nombre ?? ""} ${venta.cliente?.apellido ?? ""}`.trim(),
    header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Cliente <ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
    cell: ({ row }) => {
      const cliente = row.original.cliente;
      return (
        <div className="min-w-0 max-w-48">
          <p className="truncate font-medium">{cliente ? `${cliente.nombre} ${cliente.apellido}` : "Sin cliente"}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.usuarioFiltro || "Usuario actual"}</p>
        </div>
      );
    },
    meta: { className: "w-[22%] whitespace-normal" },
  },
  {
    accessorKey: "total",
    header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Monto <ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
    cell: ({ row }) => (
      <div className="min-w-26">
        <p className="font-medium">{formatHnl(row.original.total ?? 0)}</p>
        <p className="text-xs text-muted-foreground">ISV: {formatHnl(row.original.isv ?? 0)}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.conEnvio ? `Envío: ${formatHnl(row.original.envio ?? 0)}` : "Sin envío"}
        </p>
      </div>
    ),
    meta: { className: "w-[16%] whitespace-normal" },
  },
  {
    id: "detalle",
    header: "Detalle",
    cell: ({ row }) => {
      const productos = row.original.productos ?? [];
      const documento = row.original.tipoDocumento === "FACTURA" ? "Factura" : "Recibo";
      const pago = row.original.metodoPago === "TRANSFERENCIA" ? "Transferencia" : "Efectivo";

      return (
        <div className="min-w-0 max-w-56 space-y-1">
          {productos.length ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button type="button" className="text-sm underline-offset-2 hover:underline">
                  {productos.length} producto{productos.length === 1 ? "" : "s"}
                </button>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-1 text-sm text-foreground">
                  {productos.map((detalle, index) => (
                    <p key={index} className="whitespace-pre-wrap wrap-break-word">
                      {detalle.cantidad} x {detalle.producto ? getProductoLabel(detalle.producto) : "Producto"}
                    </p>
                  ))}
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <span className="text-sm text-muted-foreground">Sin productos</span>
          )}
          <p className="truncate text-xs text-muted-foreground">{documento} · {pago}</p>
        </div>
      );
    },
    meta: { className: "w-[28%] whitespace-normal" },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => <Badge variant="outline">{row.original.estado}</Badge>,
    meta: { className: "w-[14%] whitespace-normal" },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Acciones</DropdownMenuLabel><Link href={`/ventas/${row.original.id}`}><DropdownMenuItem>Ver venta</DropdownMenuItem></Link><Link href={`/ventas/${row.original.id}/edit`}><DropdownMenuItem>Editar</DropdownMenuItem></Link><CambiarEstadoActions venta={row.original} /></DropdownMenuContent></DropdownMenu>,
    meta: { className: "w-[4rem]" },
  },
];
