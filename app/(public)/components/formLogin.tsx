"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, KeyRound, UserRound } from "lucide-react";
import { saveLoginTasksToast } from "@/components/login-tasks-toast";
import { loginWithCredentialsAction } from "../actions";
import { initialLoginState } from "../state";

function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="h-10 w-full rounded-xl font-bold shadow-md shadow-foreground/10" type="submit" disabled={pending}>
      {pending ? "Ingresando..." : "Ingresar"}
    </Button>
  );
}

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, loginAction] = useActionState(loginWithCredentialsAction, initialLoginState);

  useEffect(() => {
    if (loginState.ok && loginState.redirect) {
      if ((loginState.tareasHoy ?? 0) > 0) {
        saveLoginTasksToast(loginState.tareasHoy ?? 0);
      }
      router.push(loginState.redirect);
    }
  }, [loginState.ok, loginState.redirect, loginState.tareasHoy, router]);

  return (
    <div className="space-y-3">
      <form action={loginAction} className="space-y-3 rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
          <div className="space-y-2">
            <label htmlFor="identifier" className="text-sm font-semibold">Usuario o correo</label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="identifier"
                name="identifier"
                placeholder="tu_usuario o tu-correo@dominio.com"
                required
                className="h-10 rounded-xl border-border/70 bg-background/90 pl-9 focus-visible:ring-2 focus-visible:ring-accent/60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="contrasena" className="text-sm font-semibold">Contraseña</label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="contrasena"
                name="contrasena"
                type={showPassword ? "text" : "password"}
                required
                className="h-10 rounded-xl border-border/70 bg-background/90 pl-9 pr-10 focus-visible:ring-2 focus-visible:ring-accent/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {loginState.message ? (
            <p className={`text-sm ${loginState.ok ? "text-green-600" : "text-destructive"}`}>{loginState.message}</p>
          ) : null}

          <LoginSubmitButton />
      </form>
    </div>
  );
}
