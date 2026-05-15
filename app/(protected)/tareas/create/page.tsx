import { getUsuariosOpciones } from "@/app/(protected)/usuarios/actions";
import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { Formulario } from "../components/Form";

export default async function CreateTareaPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_tarea")) return <NoAcceso />;
  const usuarios = await getUsuariosOpciones();
  const initialData = { nombre:"", descripcion:"", estado:"PENDIENTE" as const, fechaFinalizacion: new Date(), asignadoAId: usuarios[0]?.id ?? "", asignadoPorId: usuarios[0]?.id ?? "" };
  return <div><HeaderComponent Icon={PlusCircle} screenName="Crear tarea" description="En este apartado podrás crear una tarea" /><Formulario isUpdate={false} initialData={initialData} usuarios={usuarios} /></div>;
}
