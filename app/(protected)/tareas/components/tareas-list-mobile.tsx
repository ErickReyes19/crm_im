"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { TareaTableRow } from "./columns";

export default function TareasListMobile({ tareas }: { tareas: TareaTableRow[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = tareas.filter((tarea) => `${tarea.nombre} ${tarea.descripcion} ${tarea.estado} ${tarea.asignadoA?.usuario ?? ""} ${tarea.asignadoPor?.usuario ?? ""}`.toLowerCase().includes(searchTerm.toLowerCase()));

  return <div className="space-y-4"><Link href="/tareas/create"><Button className="w-full">Nueva tarea <Plus /></Button></Link><div className="relative"><Input className="pl-10" placeholder="Buscar tarea..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /></div>{filtered.map((tarea) => <div key={tarea.id} className="flex justify-between rounded-lg border p-4"><div><p className="font-medium">{tarea.nombre}</p><p className="text-xs">{tarea.descripcion}</p><p className="text-xs">Estado: {tarea.estado}</p><p className="text-xs">Asignado a: {tarea.asignadoA?.usuario ?? "Sin asignar"}</p><p className="text-xs">Cliente: {tarea.cliente ? `${tarea.cliente.nombre} ${tarea.cliente.apellido}` : "Sin cliente"}</p></div><Link href={`/tareas/${tarea.id}/edit`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link></div>)}</div>;
}
