"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Venta } from "../schema";

export default function VentasListMobile({ ventas }: { ventas: Venta[] }) {
const [searchTerm,setSearchTerm]=useState(""); const filtered=ventas.filter(v=>`${v.clienteId} ${v.estado}`.toLowerCase().includes(searchTerm.toLowerCase()));
return <div className="space-y-4"><Link href="/ventas/create"><Button className="w-full">Nueva venta <Plus/></Button></Link><div className="relative"><Input className="pl-10" placeholder="Buscar venta..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} /><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/></div>{filtered.map(v=><div key={v.id} className="p-4 border rounded-lg flex justify-between"><div><p className="font-medium">Venta #{v.id?.slice(0,8)}</p><p className="text-xs">Estado: {v.estado}</p><p className="text-xs">Total: {v.total}</p></div><Link href={`/ventas/${v.id}/edit`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4"/></Button></Link></div>)}</div>;
}
