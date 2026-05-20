import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { getNotasOpciones, getTareaById } from "../../actions";
import { Formulario } from "../../components/Form";

export default async function EditTareaPage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_tarea")) return <NoAcceso />;
  const { id } = await params;
  const tarea = await getTareaById(id);
  if (!tarea) redirect("/tareas");
  const notas = await getNotasOpciones();

  return <div className="container mx-auto py-2 space-y-4"><HeaderComponent Icon={Pencil} description="Edita una tarea de seguimiento" screenName="Editar tarea" /><Formulario isUpdate notas={notas} initialData={{...tarea, descripcion: tarea.descripcion ?? undefined}} /></div>;
}
