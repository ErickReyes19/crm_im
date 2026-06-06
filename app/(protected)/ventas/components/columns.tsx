"use client";

import { cambiarEstadoVenta } from "@/app/(protected)/ventas/actions";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Loader2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

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
  cliente?: { nombre: string; apellido: string } | null;
  usuario?: { id: string; usuario: string; nombre: string | null } | null;
  usuarioFiltro: string;
  productos?: Array<{ cantidad: number; subtotal: number; producto?: { nombre: string } | null }>;
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
      return cliente ? `${cliente.nombre} ${cliente.apellido}` : "Sin cliente";
    },
  },
  {
    id: "usuario",
    accessorFn: (venta) => venta.usuarioFiltro,
    header: "Vendedor",
    cell: ({ row }) => row.original.usuarioFiltro || "Usuario actual",
  },
  {
    accessorKey: "total",
    header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Total <ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
    cell: ({ row }) => Number(row.original.total).toLocaleString("es-DO", { style: "currency", currency: "HNL" }),
  },
  { id: "tipoDocumento", header: "Documento", cell: ({ row }) => row.original.tipoDocumento === "FACTURA" ? "Factura" : "Recibo" },
  { id: "isv", header: "ISV", cell: ({ row }) => Number(row.original.isv ?? 0).toLocaleString("es-DO", { style: "currency", currency: "HNL" }) },
  { id: "envio", header: "Envío", cell: ({ row }) => row.original.conEnvio ? Number(row.original.envio ?? 0).toLocaleString("es-DO", { style: "currency", currency: "HNL" }) : "Sin envío" },
  {
    id: "productosResumen",
    header: "Productos",
    cell: ({ row }) => {
      const productos = row.original.productos ?? [];
      const summary = productos.length
        ? productos.map((detalle) => `${detalle.cantidad} x ${detalle.producto?.nombre ?? "Producto"}`).join(", ")
        : "Sin productos";

      return productos.length ? (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="inline-block max-w-[20rem] wrap-break-word line-clamp-2 cursor-help">{summary}</span>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-1 text-sm text-foreground">
              {productos.map((detalle, index) => (
                <p key={index} className="whitespace-pre-wrap wrap-break-word">
                  {detalle.cantidad} x {detalle.producto?.nombre ?? "Producto"}
                </p>
              ))}
            </div>
          </HoverCardContent>
        </HoverCard>
      ) : (
        <span className="text-muted-foreground">Sin productos</span>
      );
    },
  },
  { accessorKey: "estado", header: "Estado" },
  { id: "metodoPago", header: "Pago", cell: ({ row }) => row.original.metodoPago === "TRANSFERENCIA" ? "Transferencia" : "Efectivo" },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Acciones</DropdownMenuLabel><Link href={`/ventas/${row.original.id}`}><DropdownMenuItem>Ver venta</DropdownMenuItem></Link><Link href={`/ventas/${row.original.id}/edit`}><DropdownMenuItem>Editar</DropdownMenuItem></Link><CambiarEstadoActions venta={row.original} /></DropdownMenuContent></DropdownMenu>,
  },
];
