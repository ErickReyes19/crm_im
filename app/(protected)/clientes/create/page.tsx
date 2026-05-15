import { getUsuariosOpciones } from "@/app/(protected)/usuarios/actions";
import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { Formulario } from "../components/Form";

export default async function CreateClientePage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_cliente")) return <NoAcceso />;
  const usuarios = await getUsuariosOpciones();
  const initialData = { nombre:"", apellido:"", ciudad:"", correo:"", numero:"", direccion:"", etiqueta:"NUEVO" as const, usuarioAsignadoId: usuarios[0]?.id ?? "", activo:true };
  return <div><HeaderComponent Icon={PlusCircle} screenName="Crear cliente" description="En este apartado podrás crear un cliente" /><Formulario isUpdate={false} initialData={initialData} usuarios={usuarios} /></div>;
}
