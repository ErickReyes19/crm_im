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
import { KeyRound, LayersIcon, UserIcon } from "lucide-react";

const modules = [
  { title: "Usuarios", url: "/usuarios", icon: UserIcon, permiso: "ver_usuarios" },
  { title: "Roles", url: "/roles", icon: LayersIcon, permiso: "ver_roles" },
  { title: "Permisos", url: "/permisos", icon: KeyRound, permiso: "ver_permisos" },
];

export async function AppSidebar() {
  const usuario = await getSession();
  const permisosUsuario = usuario?.Permiso || [];

  const filteredModules = modules.filter((item) => permisosUsuario.includes(item.permiso));

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r bg-sidebar">
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
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon size={16} />
                      <span>{item.title}</span>
                    </a>
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
