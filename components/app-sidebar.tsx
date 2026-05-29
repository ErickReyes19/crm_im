import { getSession } from "@/auth";
import { NavUser } from "@/components/nav-user";
import { ModeToggle } from "@/components/buton-theme";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Activity, BarChart3, ClipboardList, HandCoins, LayersIcon, Package, StickyNote, UserIcon, Users, UserRoundCheck, type LucideIcon } from "lucide-react";

type SidebarModule = {
  title: string;
  url: string;
  icon: LucideIcon;
  permiso?: string;
  permisos?: string[];
};

const modules: SidebarModule[] = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3, permisos: ["ver_dashboard", "ver_ventas"] },
  { title: "Usuarios", url: "/usuarios", icon: UserIcon, permiso: "ver_usuarios" },
  { title: "Jerarquía", url: "/usuarios/jerarquia", icon: Users, permiso: "super_admin" },
  { title: "Roles", url: "/roles", icon: LayersIcon, permiso: "ver_roles" },
  { title: "Clientes", url: "/clientes", icon: Users, permiso: "ver_clientes" },
  { title: "Asignaciones", url: "/clientes/asignaciones", icon: UserRoundCheck, permiso: "asignar_clientes" },
  { title: "Productos", url: "/productos", icon: Package, permiso: "ver_productos" },
  { title: "Ventas", url: "/ventas", icon: HandCoins, permiso: "ver_ventas" },
  { title: "Notas", url: "/notas", icon: StickyNote, permiso: "ver_clientes" },
  { title: "Tareas", url: "/tareas", icon: ClipboardList, permiso: "ver_tareas" },
  { title: "Accesos", url: "/accesos", icon: Activity, permiso: "ver_online" },
];

export async function AppSidebar() {
  const usuario = await getSession();
  const permisosUsuario = usuario?.Permiso || [];

  const filteredModules = modules.filter((item) => item.permisos?.some((permiso) => permisosUsuario.includes(permiso)) ?? (item.permiso ? permisosUsuario.includes(item.permiso) : false));

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 flex items-center justify-between text-sidebar-foreground">
            <span className="font-semibold tracking-tight">Panel CRM</span>
            <ModeToggle />
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {filteredModules.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton href={item.url}>
                    <item.icon size={16} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{usuario && <NavUser usuario={usuario} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
