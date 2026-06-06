import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { Formulario } from "../components/Form";

export default async function CreateProductoPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_producto")) return <NoAcceso />;

  return <div className="w-full m-2"><HeaderComponent Icon={PlusCircle} screenName="Crear producto" description="En este apartado podrás crear un producto" /><Formulario isUpdate={false} initialData={{ nombre: "", descripcion: "", stock: 0, stockMinimo: 0, activo: true }} /></div>;
}
