"use client"

import { Building2, Package, Truck, Users, BarChart3, Settings, FileText, MapPin } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: BarChart3 },
      { title: "Projects", url: "/projects", icon: Building2 },
    ],
  },
  {
    title: "Data Management",
    items: [
      { title: "Deliveries", url: "/deliveries", icon: Truck },
      { title: "Materials", url: "/materials", icon: Package },
      { title: "Cost Codes", url: "/cost-codes", icon: FileText },
      { title: "Locations", url: "/locations", icon: MapPin },
    ],
  },
  {
    title: "Administration",
    items: [
      { title: "Users", url: "/users", icon: Users },
      { title: "Test Connection", url: "/test-connection", icon: Settings },
      { title: "Inspect Database", url: "/inspect-db", icon: Settings },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Carbon Tracker</p>
            <p className="text-xs text-muted-foreground">Emissions Management</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground">Principal</p>
          </div>
        </div>
      </div>
      <SidebarRail />
    </Sidebar>
  )
}
