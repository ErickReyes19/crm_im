import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { getClientesConNotasOpciones, getNotasOpcionesByCliente, getTareaById } from "../../actions";
import { Formulario } from "../../components/Form";

export default async function EditTareaPage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_tarea")) return <NoAcceso />;
  const { id } = await params;
  const tarea = await getTareaById(id);
  if (!tarea) redirect("/tareas");
  const [clientes, notas] = await Promise.all([getClientesConNotasOpciones(), getNotasOpcionesByCliente(tarea.nota.clienteId)]);

  return <div className="container mx-auto py-2 space-y-4"><HeaderComponent Icon={Pencil} description="Edita una tarea de seguimiento" screenName="Editar tarea" /><Formulario isUpdate clientes={clientes} notasIniciales={notas} initialData={{ id: tarea.id, notaId: tarea.notaId, clienteId: tarea.nota.clienteId, titulo: tarea.titulo, descripcion: tarea.descripcion ?? undefined, fechaObjetivo: tarea.fechaObjetivo, estado: tarea.estado }} /></div>;
}
