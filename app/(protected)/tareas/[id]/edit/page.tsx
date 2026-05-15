import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { getTareaById } from "../../actions";

export default async function EditTareaPage({ params }: { params: { id: string } }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_tarea")) return <NoAcceso />;

  const tarea = await getTareaById(params.id);
  if (!tarea) redirect("/tareas");

  return <HeaderComponent Icon={Pencil} screenName="Editar tarea" description={`Editando tarea: ${tarea.nombre}`} />;
}
