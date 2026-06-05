import { getSession } from "@/auth";
import { getImageFromS3 } from "@/lib/s3-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const session = await getSession();
  if (!session?.IdUser) return new Response("Sesión requerida", { status: 401 });

  const { key } = await params;
  const s3Key = key.join("/");
  if (!s3Key.startsWith("ventas/") && !s3Key.startsWith("notas/")) {
    return new Response("Ruta inválida", { status: 400 });
  }

  const response = await getImageFromS3(s3Key);
  if (!response.ok) return new Response("Imagen no encontrada", { status: response.status });

  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    },
  });
}
