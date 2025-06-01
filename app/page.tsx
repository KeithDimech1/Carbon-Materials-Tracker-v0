import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, Building2, Truck, Package, AlertCircle } from "lucide-react"
import { getDashboardStats, getProjects, getMaterials } from "@/lib/queries"

// Helper function to get emissions from delivery data
function getEmissionsFromDelivery(delivery: any): number {
  const emissionColumns = ["embodied_co2", "co2_emissions", "emissions", "carbon_emissions"]
  for (const col of emissionColumns) {
    if (col in delivery && typeof delivery[col] === "number") {
      return delivery[col]
    }
  }
  return 0
}

export default async function Dashboard() {
  try {
    const [stats, projects, materials] = await Promise.all([
      getDashboardStats().catch(() => ({
        totalEmissions: 0,
        activeProjects: 0,
        recentDeliveries: 0,
        materialsCount: 0,
      })),
      getProjects().catch(() => []),
      getMaterials().catch(() => []),
    ])

    // Calculate top materials by emissions
    const topMaterials =
      materials
        ?.map((material) => ({
          name: material.name,
          totalEmissions:
            material.deliveries?.reduce((sum, delivery) => sum + getEmissionsFromDelivery(delivery), 0) || 0,
          totalQuantity: material.deliveries?.reduce((sum, delivery) => sum + (delivery.quantity || 0), 0) || 0,
        }))
        .sort((a, b) => b.totalEmissions - a.totalEmissions)
        .slice(0, 3) || []

    const maxEmissions = Math.max(...topMaterials.map((m) => m.totalEmissions), 1)

    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="ml-auto">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Delivery
            </Button>
          </div>
        </header>

        <div className="flex-1 space-y-6 p-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total CO₂ Emissions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.totalEmissions / 1000).toFixed(1)} tCO₂e</div>
                <p className="text-xs text-muted-foreground">Across all projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProjects}</div>
                <p className="text-xs text-muted-foreground">Currently in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Deliveries</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentDeliveries}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Materials Tracked</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.materialsCount}</div>
                <p className="text-xs text-muted-foreground">Available materials</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Latest project activity and emissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects && projects.length > 0 ? (
                  projects.slice(0, 3).map((project) => {
                    const totalEmissions =
                      project.deliveries?.reduce((sum, delivery) => sum + getEmissionsFromDelivery(delivery), 0) || 0
                    return (
                      <div key={project.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{(totalEmissions / 1000).toFixed(1)} tCO₂e</p>
                        </div>
                        <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>No projects found. Check your database connection.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Materials by Emissions</CardTitle>
                <CardDescription>Highest carbon impact materials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topMaterials && topMaterials.length > 0 ? (
                  topMaterials.map((material, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{material.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(material.totalEmissions / 1000).toFixed(1)} tCO₂e
                        </p>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(material.totalEmissions / maxEmissions) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>No materials found. Check your database connection.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    )
  } catch (error) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Database Connection Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Unable to connect to the database. Please check your connection settings.
              </p>
              <div className="flex gap-2">
                <Button asChild>
                  <a href="/test-connection">Test Connection</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/inspect-db">Inspect Database</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    )
  }
}
