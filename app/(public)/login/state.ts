export type LoginActionState = {
  ok: boolean;
  message: string;
  redirect?: string;
  tareasHoy?: number;
};

export const initialLoginState: LoginActionState = {
  ok: false,
  message: "",
};
