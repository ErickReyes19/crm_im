import { getSession } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Login from "./components/formLogin";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/mi-perfil");

  return (
    <main className="grid h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.12),transparent_32%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--secondary)/0.35)_100%)] lg:grid-cols-2">
      <section className="relative hidden h-full overflow-hidden lg:block">
        <Image
          src="/images/login.png"
          alt="Escena editorial con periódico y café"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-tr from-foreground/75 via-foreground/45 to-accent/35" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white/90 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Acceso premium
          </p>
          <blockquote className="max-w-xl space-y-5">
            <p className="font-serif text-2xl font-bold leading-tight tracking-tight text-white">
              &ldquo;Desde que me suscribí a Flip, empiezo cada mañana con los
              mejores artículos. La experiencia de lectura es impecable.&rdquo;
            </p>
            <footer className="text-sm text-white/80">
              <span className="font-semibold text-white">
                Sofía Martínez
              </span>{" "}
              &mdash; Lectora desde 2023
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="flex h-full flex-col items-center justify-center px-5 py-6 lg:px-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 py-1.5 shadow-sm backdrop-blur-md">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            Inicio seguro
          </span>
        </div>

        <div className="mb-4 flex items-center gap-3">
          {/* <Image
            src="https://d3dr34vkycigpz.cloudfront.net/wp-content/uploads/2025/09/TiempoHonduras-1-2.webp"
            alt="Logo de Diario Tiempo"
            width={180}
            height={36}
            className="h-9 w-auto"
            priority
          /> */}
        </div>

        <div className="w-full max-w-lg">
          <Card className="border-border/60 bg-card/90 shadow-2xl shadow-foreground/10 backdrop-blur-xl">
            <CardHeader className="space-y-1.5 pb-3">
              <CardTitle className="font-serif text-2xl font-black tracking-tight">
                Iniciar sesión
              </CardTitle>
              <CardDescription className="text-[0.8rem] leading-relaxed">
                Accede a tu membresía para leer la edición premium, hemeroteca y cobertura en tiempo real.
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
        </div>
      </section>


    </main>
  );
}
