"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductoTableRow } from "./columns";

export default function ProductosListMobile({ productos }: { productos: ProductoTableRow[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = productos.filter((producto) => `${producto.nombre} ${producto.descripcion} ${producto.creadoPor?.usuario ?? ""}`.toLowerCase().includes(searchTerm.toLowerCase()));

  return <div className="space-y-4"><Link href="/productos/create"><Button className="w-full">Nuevo producto <Plus /></Button></Link><div className="relative"><Input className="pl-10" placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /></div>{filtered.map((producto) => <div key={producto.id} className="flex justify-between rounded-lg border p-4"><div><p className="font-medium">{producto.nombre}</p><p className="text-xs">{producto.descripcion}</p><p className="text-xs">Precio: {Number(producto.precio).toLocaleString("es-DO", { style: "currency", currency: "HNL" })}</p><p className="text-xs">Estado: {producto.activo ? "Activo" : "Inactivo"}</p></div><Link href={`/productos/${producto.id}/edit`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link></div>)}</div>;
}
