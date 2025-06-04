"use client"

import type * as React from "react"
import { BarChart3, Building2, FileText, Home, Package, Settings, Users } from "lucide-react"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Update the navigation data to remove "Data Management" and update structure
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: Building2,
    },
    {
      title: "Material Library",
      url: "/material-library",
      icon: Package,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: FileText,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
  ],
  navSecondary: [
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props} className="bg-pathway-green">
      <SidebarHeader className="bg-pathway-green">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex items-center justify-center">
            <Image
              src="/images/pathway-logo.png"
              alt="Pathway Logo"
              width={150}
              height={60}
              className="object-contain"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-pathway-green">
        <SidebarGroup>
          <SidebarGroupLabel className="text-pathway-cream">Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-pathway-cream hover:bg-pathway-dark-green">
                    <a href={item.url}>
                      <item.icon className="text-pathway-gold" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-pathway-cream">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-pathway-cream hover:bg-pathway-dark-green">
                    <a href={item.url}>
                      <item.icon className="text-pathway-gold" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-pathway-green">
        <div className="p-4 text-xs text-pathway-cream">© 2024 Pathway Carbon Tracking</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
