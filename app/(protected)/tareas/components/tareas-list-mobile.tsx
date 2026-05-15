"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Tarea } from "../schema";

export default function TareasListMobile({ tareas }: { tareas: Tarea[] }) {
const [searchTerm,setSearchTerm]=useState(""); const filtered=tareas.filter(t=>`${t.nombre} ${t.descripcion}`.toLowerCase().includes(searchTerm.toLowerCase()));
return <div className="space-y-4"><Link href="/tareas/create"><Button className="w-full">Nueva tarea <Plus/></Button></Link><div className="relative"><Input className="pl-10" placeholder="Buscar tarea..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} /><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/></div>{filtered.map(t=><div key={t.id} className="p-4 border rounded-lg flex justify-between"><div><p className="font-medium">{t.nombre}</p><p className="text-xs">{t.descripcion}</p><p className="text-xs">{t.estado}</p></div><Link href={`/tareas/${t.id}/edit`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4"/></Button></Link></div>)}</div>;
}
