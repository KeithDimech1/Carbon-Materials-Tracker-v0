"use client"
import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MapPin, Calendar, Truck, Plus, BarChart3, Users, Building } from "lucide-react"
import Link from "next/link"
import { DeliveriesInterface } from "./deliveries-interface"
import { CarbonDashboard } from "./carbon-dashboard"
import { ContractorsView } from "./contractors-view"
import { SuppliersView } from "./suppliers-view"
import { MonthlyDeliveriesTable } from "./monthly-deliveries-table"

interface ProjectDetailsClientProps {
  project: any
  deliveries: any[]
  costCodes: any[]
  locations: any[]
  locationTypes: any[]
}

export function ProjectDetailsClient({
  project,
  deliveries,
  costCodes,
  locations,
  locationTypes,
}: ProjectDetailsClientProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate project stats
  const totalEmissions = deliveries.reduce((sum, delivery) => sum + (delivery.embodied_co2 || 0), 0)
  const totalDeliveries = deliveries.length
  const uniqueSuppliers = new Set(deliveries.map((d) => d.supplier_id)).size
  const recentDeliveries = deliveries.filter((d) => {
    const deliveryDate = new Date(d.delivery_date)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return deliveryDate >= oneWeekAgo
  }).length

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-pathway-gold/20 px-4 bg-pathway-green/5">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-pathway-gold/30" />
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="text-pathway-green hover:bg-pathway-green/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-pathway-green">{project.name}</h1>
          <Badge variant="outline" className="border-pathway-gold text-pathway-green">
            {project.status_name || "Active"}
          </Badge>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Project Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-pathway-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pathway-green">Total Emissions</CardTitle>
              <BarChart3 className="h-4 w-4 text-pathway-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pathway-green">{totalEmissions.toFixed(1)} tCO₂e</div>
            </CardContent>
          </Card>
          <Card className="border-pathway-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pathway-green">Total Deliveries</CardTitle>
              <Truck className="h-4 w-4 text-pathway-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pathway-green">{totalDeliveries}</div>
            </CardContent>
          </Card>
          <Card className="border-pathway-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pathway-green">Active Suppliers</CardTitle>
              <Users className="h-4 w-4 text-pathway-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pathway-green">{uniqueSuppliers}</div>
            </CardContent>
          </Card>
          <Card className="border-pathway-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pathway-green">Recent Deliveries</CardTitle>
              <Calendar className="h-4 w-4 text-pathway-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pathway-green">{recentDeliveries}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries Information</TabsTrigger>
            <TabsTrigger value="carbon">Carbon Dashboard</TabsTrigger>
            <TabsTrigger value="contractors">Contractors</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-pathway-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pathway-green">
                    <Building className="h-5 w-5 text-pathway-gold" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Project Number</p>
                      <p className="font-semibold">{project.project_number || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Status</p>
                      <p className="font-semibold">{project.status_name || "Active"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Start Date</p>
                      <p className="font-semibold">
                        {project.start_date ? new Date(project.start_date).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">End Date</p>
                      <p className="font-semibold">
                        {project.end_date ? new Date(project.end_date).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  {project.Description && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-2">Description</p>
                      <p className="text-sm">{project.Description}</p>
                    </div>
                  )}
                  {project.latitude && project.longitude && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-2">Location</p>
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-pathway-gold" />
                        {project.latitude}, {project.longitude}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-pathway-gold/20">
                <CardHeader>
                  <CardTitle className="text-pathway-green">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start bg-pathway-green hover:bg-pathway-green/90 text-pathway-cream"
                    onClick={() => setActiveTab("deliveries")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deliveries
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-pathway-gold text-pathway-green hover:bg-pathway-green/10"
                    onClick={() => setActiveTab("carbon")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Carbon Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-pathway-gold text-pathway-green hover:bg-pathway-green/10"
                    onClick={() => setActiveTab("monthly")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Monthly Deliveries
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deliveries">
            <DeliveriesInterface
              projectId={project.project_id}
              deliveries={deliveries}
              costCodes={costCodes}
              locations={locations}
            />
          </TabsContent>

          <TabsContent value="carbon">
            <CarbonDashboard projectId={project.project_id} deliveries={deliveries} locations={locations} />
          </TabsContent>

          <TabsContent value="contractors">
            <ContractorsView projectId={project.project_id} deliveries={deliveries} />
          </TabsContent>

          <TabsContent value="suppliers">
            <SuppliersView projectId={project.project_id} deliveries={deliveries} />
          </TabsContent>

          <TabsContent value="monthly">
            <MonthlyDeliveriesTable projectId={project.project_id} deliveries={deliveries} />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
