"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { VentaTableRow } from "./columns";

export default function VentasListMobile({ ventas }: { ventas: VentaTableRow[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = ventas.filter((venta) => `${venta.cliente?.nombre ?? ""} ${venta.cliente?.apellido ?? ""} ${venta.usuario?.usuario ?? ""} ${venta.estado} ${venta.metodoPago ?? ""} ${venta.productos?.map((detalle) => detalle.producto?.nombre).join(" ") ?? ""}`.toLowerCase().includes(searchTerm.toLowerCase()));

  return <div className="space-y-4"><Link href="/ventas/create"><Button className="w-full">Nueva venta <Plus /></Button></Link><div className="relative"><Input className="pl-10" placeholder="Buscar venta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /></div>{filtered.map((venta) => <div key={venta.id} className="flex justify-between rounded-lg border p-4"><div><p className="font-medium">{venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido}` : `Venta #${venta.id?.slice(0, 8)}`}</p><p className="text-xs">Vendedor: {venta.usuario?.usuario ?? "Usuario actual"}</p><p className="text-xs">Estado: {venta.estado}</p><p className="text-xs">Pago: {venta.metodoPago === "TRANSFERENCIA" ? "Transferencia" : "Efectivo"}</p><p className="text-xs">Productos: {venta.productos?.length ? venta.productos.map((detalle) => `${detalle.cantidad} x ${detalle.producto?.nombre ?? "Producto"}`).join(", ") : "Sin productos"}</p><p className="text-xs">Total: {Number(venta.total).toLocaleString("es-DO", { style: "currency", currency: "HNl" })}</p></div><Link href={`/ventas/${venta.id}/edit`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link></div>)}</div>;
}
