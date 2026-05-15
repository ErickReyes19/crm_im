"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, KeyRound, Mail, UserRound } from "lucide-react";

import { toast } from "sonner";
import ForgotPasswordForm from "../../forgot-password/components/forworgot";
import { registerWithEmailAction } from "../../actions";
import { initialLoginState } from "../state";
import { loginWithCredentialsAction } from "../actions";

function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="h-10 w-full rounded-xl font-bold shadow-md shadow-foreground/10"
      type="submit"
      disabled={pending}
    >
      {pending ? "Ingresando..." : "Ingresar"}
    </Button>
  );
}

export default function Login() {
  const router = useRouter();
  const [openForgot, setOpenForgot] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);
  const [loginState, loginAction] = useActionState(
    loginWithCredentialsAction,
    initialLoginState
  ); const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (loginState.ok && loginState.redirect) {
      router.push(loginState.redirect);
    }
  }, [loginState.ok, loginState.redirect, router]);

  async function handleRegisterSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setIsSubmittingRegister(true);

    const formData = new FormData(event.currentTarget);

    try {
      const created = await registerWithEmailAction(formData);
      if (created) {
        toast.success("Te enviamos una contraseña temporal a tu correo.");
        setOpenRegister(false);
        router.push("/login");
      } else {
        toast.error("No se pudo completar el registro. Inténtalo nuevamente.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setIsSubmittingRegister(false);
    }
  }

  return (
    <>
      <div className="space-y-3">
        <form
          action={loginAction}
          className="space-y-3 rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm"
        >
          <div className="space-y-2">
            <label htmlFor="identifier" className="text-sm font-semibold">
              Usuario o correo
            </label>
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
            <label htmlFor="contrasena" className="text-sm font-semibold">
              Contraseña
            </label>
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
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {loginState.message ? (
            <p
              className={`text-sm ${loginState.ok ? "text-green-600" : "text-destructive"
                }`}
            >
              {loginState.message}
            </p>
          ) : null}

          <LoginSubmitButton />
        </form>


        <Button
          className="h-10 w-full rounded-xl border-border/70 bg-background/70"
          variant="outline"
          type="button"
          onClick={() => setOpenRegister(true)}
        >
          <Mail className="mr-2 h-4 w-4" />
          Registrarme con correo
        </Button>

        <Button
          className="w-full"
          variant="link"
          type="button"
          onClick={() => setOpenForgot(true)}
        >
          ¿Olvidaste tu contraseña?
        </Button>
      </div>

      {/* REGISTER MODAL */}
      <Dialog open={openRegister} onOpenChange={setOpenRegister}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registro con correo</DialogTitle>
            <DialogDescription>
              Ingresa nombre, apellido y correo para crear tu cuenta. Te
              enviaremos una contraseña temporal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-4">
            <Input
              name="nombre"
              placeholder="Nombre"
              required
              disabled={isSubmittingRegister}
            />
            <Input
              name="apellido"
              placeholder="Apellido"
              required
              disabled={isSubmittingRegister}
            />
            <Input
              name="email"
              type="email"
              placeholder="Correo"
              required
              disabled={isSubmittingRegister}
            />

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpenRegister(false)}
                disabled={isSubmittingRegister}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingRegister}>
                {isSubmittingRegister ? "Creando..." : "Crear cuenta"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* FORGOT PASSWORD */}
      <Dialog open={openForgot} onOpenChange={setOpenForgot}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Recuperar contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu usuario para recibir instrucciones.
            </DialogDescription>
          </DialogHeader>

          <ForgotPasswordForm
            onCancel={() => setOpenForgot(false)}
            onSuccess={() => {
              setOpenForgot(false);
              toast.success(
                "Te enviamos instrucciones para restablecer tu contraseña."
              );
              router.push("/login");
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}