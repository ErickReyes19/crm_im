import { getUsuariosOpciones } from "@/app/(protected)/usuarios/actions";
import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { getTareaById } from "../../actions";
import { Formulario } from "../../components/Form";

export default async function EditTareaPage({ params }: { params: { id: string } }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_tarea")) return <NoAcceso />;
  const tarea = await getTareaById(params.id); if (!tarea) redirect('/tareas');
  const usuarios = await getUsuariosOpciones();
  return <div><HeaderComponent Icon={Pencil} screenName="Editar tarea" description="En este apartado podrás editar una tarea" /><Formulario isUpdate initialData={tarea} usuarios={usuarios} /></div>;
}
