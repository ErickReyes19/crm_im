import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { getNotasOpciones } from "../actions";
import { Formulario } from "../components/Form";

export default async function CreateTareaPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_tarea")) return <NoAcceso />;
  const notas = await getNotasOpciones();

  return <div className="container mx-auto py-2 space-y-4"><HeaderComponent Icon={PlusCircle} description="Crea tareas de seguimiento enlazadas a notas" screenName="Crear tarea" /><Formulario notas={notas} /></div>;
}
