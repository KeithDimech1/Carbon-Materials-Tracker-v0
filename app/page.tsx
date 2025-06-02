import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Building2, Package, Truck, TrendingUp, TrendingDown } from "lucide-react"

export default function DashboardPage() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-pathway-gold/20 px-4 bg-pathway-green/5">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-pathway-gold/30" />
        <h1 className="text-lg font-semibold text-pathway-green">Dashboard</h1>
      </header>

      <div className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234.5 tCO₂e</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-3 w-3 mr-1" />
                -2.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +3 new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materials Tracked</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">456</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Deliveries</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Latest infrastructure projects being tracked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Highway Extension Project</p>
                    <p className="text-sm text-muted-foreground">Started 2 weeks ago</p>
                  </div>
                  <Badge variant="outline" className="bg-pathway-green/10 text-pathway-green border-pathway-green">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Bridge Reconstruction</p>
                    <p className="text-sm text-muted-foreground">Started 1 month ago</p>
                  </div>
                  <Badge variant="outline" className="bg-pathway-green/10 text-pathway-green border-pathway-green">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Urban Development Phase 2</p>
                    <p className="text-sm text-muted-foreground">Completed last week</p>
                  </div>
                  <Badge variant="outline">Completed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emission Trends</CardTitle>
              <CardDescription>Carbon emissions over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">January</span>
                  <span className="text-sm font-mono">1,456 tCO₂e</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">February</span>
                  <span className="text-sm font-mono">1,234 tCO₂e</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">March</span>
                  <span className="text-sm font-mono">1,567 tCO₂e</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">April</span>
                  <span className="text-sm font-mono">1,345 tCO₂e</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">May</span>
                  <span className="text-sm font-mono">1,234 tCO₂e</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">June</span>
                  <span className="text-sm font-mono font-medium">1,234 tCO₂e</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
