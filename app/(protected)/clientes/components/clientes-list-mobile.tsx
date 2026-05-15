"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Cliente } from "../schema";

export default function ClientesListMobile({ clientes }: { clientes: Cliente[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = clientes.filter((c) => `${c.nombre} ${c.apellido} ${c.correo}`.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="space-y-4"><Link href="/clientes/create"><Button className="w-full">Nuevo cliente <Plus /></Button></Link><div className="relative"><Input placeholder="Buscar cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /></div>{filtered.map((c)=><div key={c.id} className="p-4 border rounded-lg"><div className="flex justify-between"><div><p className="font-medium">{c.nombre} {c.apellido}</p><p className="text-xs text-muted-foreground">{c.correo}</p><p className="text-xs">{c.ciudad} • {c.etiqueta}</p></div><Link href={`/clientes/${c.id}/edit`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4"/></Button></Link></div></div>)}</div>;
}
