import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { getProductoById } from "../../actions";
import { Formulario } from "../../components/Form";

export default async function EditProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_producto")) return <NoAcceso />;

  const { id } = await params;
  const producto = await getProductoById(id);
  if (!producto) redirect("/productos");

  return <div><HeaderComponent Icon={Pencil} screenName="Editar producto" description="En este apartado podrás editar un producto" /><Formulario isUpdate initialData={{ id: producto.id, nombre: producto.nombre, descripcion: producto.descripcion, precio: Number(producto.precio), activo: producto.activo }} /></div>;
}
