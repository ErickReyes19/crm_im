"use client";
import { cambiarEstadoVenta } from "@/app/(protected)/ventas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { EstadoVenta, estadosVenta, VentaTableRow } from "./columns";

function EstadoVentaMobile({ venta }: { venta: VentaTableRow }) {
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

  if (!venta.canEditEstado) return <p className="text-xs">Estado: {venta.estado}</p>;

  return (
    <div className="mt-2 max-w-48 space-y-1">
      <p className="text-xs font-medium">Estado</p>
      <Select value={venta.estado} onValueChange={(value) => handleChangeEstado(value as EstadoVenta)} disabled={isPending}>
        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
        <SelectContent>{estadosVenta.map((estado) => <SelectItem key={estado.value} value={estado.value}>{estado.label}</SelectItem>)}</SelectContent>
      </Select>
      {isPending && <p className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />Actualizando...</p>}
    </div>
  );
}

export default function VentasListMobile({ ventas }: { ventas: VentaTableRow[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = ventas.filter((venta) => `${venta.cliente?.nombre ?? ""} ${venta.cliente?.apellido ?? ""} ${venta.usuario?.usuario ?? ""} ${venta.estado} ${venta.metodoPago ?? ""} ${venta.productos?.map((detalle) => detalle.producto?.nombre).join(" ") ?? ""}`.toLowerCase().includes(searchTerm.toLowerCase()));

  return <div className="space-y-4"><Link href="/ventas/create"><Button className="w-full">Nueva venta <Plus /></Button></Link><div className="relative"><Input className="pl-10" placeholder="Buscar venta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /></div>{filtered.map((venta) => <div key={venta.id} className="flex justify-between rounded-lg border p-4"><div><p className="font-medium">{venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido}` : `Venta #${venta.id?.slice(0, 8)}`}</p><p className="text-xs">Vendedor: {venta.usuario?.usuario ?? "Usuario actual"}</p><EstadoVentaMobile venta={venta} /><p className="text-xs">Pago: {venta.metodoPago === "TRANSFERENCIA" ? "Transferencia" : "Efectivo"}</p><p className="text-xs">Productos: {venta.productos?.length ? venta.productos.map((detalle) => `${detalle.cantidad} x ${detalle.producto?.nombre ?? "Producto"}`).join(", ") : "Sin productos"}</p><p className="text-xs">Total: {Number(venta.total).toLocaleString("es-DO", { style: "currency", currency: "HNL" })}</p></div><Link href={`/ventas/${venta.id}/edit`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link></div>)}</div>;
}
