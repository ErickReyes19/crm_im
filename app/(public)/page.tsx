import { getSession } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Login from "./components/formLogin";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md">
        <Card className="border-border/70 bg-card shadow-xl shadow-foreground/5">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Iniciar sesión
            </CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al CRM.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">
                  Cargando...
                </div>
              }
            >
              <Login />
            </Suspense>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
