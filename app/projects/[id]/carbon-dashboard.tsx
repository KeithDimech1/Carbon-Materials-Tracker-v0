"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, MapPin, Calendar } from "lucide-react"

interface CarbonDashboardProps {
  projectId: string
  deliveries: any[]
  locations: any[]
}

export function CarbonDashboard({ projectId, deliveries, locations }: CarbonDashboardProps) {
  // Calculate carbon metrics
  const totalCarbon = deliveries.reduce((sum, delivery) => sum + (delivery.embodied_co2 || 0), 0)

  // Group by material type
  const carbonByMaterialType = deliveries.reduce(
    (acc, delivery) => {
      const materialType = delivery.material?.material_type?.name || "Unknown"
      acc[materialType] = (acc[materialType] || 0) + (delivery.embodied_co2 || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  // Group by site/location
  const carbonBySite = deliveries.reduce(
    (acc, delivery) => {
      const site = delivery.location?.location_name || "Unknown Site"
      acc[site] = (acc[site] || 0) + (delivery.embodied_co2 || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  // Group by month for time series
  const carbonByMonth = deliveries.reduce(
    (acc, delivery) => {
      const date = new Date(delivery.delivery_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      acc[monthKey] = (acc[monthKey] || 0) + (delivery.embodied_co2 || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-pathway-green">Carbon Dashboard</h2>
        <p className="text-muted-foreground">Carbon emissions analysis for this project</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-pathway-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pathway-green">Total Carbon</CardTitle>
            <BarChart3 className="h-4 w-4 text-pathway-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pathway-green">{totalCarbon.toFixed(1)} tCO₂e</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Across all deliveries
            </p>
          </CardContent>
        </Card>

        <Card className="border-pathway-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pathway-green">Avg per Delivery</CardTitle>
            <BarChart3 className="h-4 w-4 text-pathway-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pathway-green">
              {deliveries.length > 0 ? (totalCarbon / deliveries.length).toFixed(1) : "0"} tCO₂e
            </div>
            <p className="text-xs text-muted-foreground">Per delivery record</p>
          </CardContent>
        </Card>

        <Card className="border-pathway-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pathway-green">Material Types</CardTitle>
            <MapPin className="h-4 w-4 text-pathway-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pathway-green">{Object.keys(carbonByMaterialType).length}</div>
            <p className="text-xs text-muted-foreground">Different material types</p>
          </CardContent>
        </Card>

        <Card className="border-pathway-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pathway-green">Active Sites</CardTitle>
            <MapPin className="h-4 w-4 text-pathway-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pathway-green">{Object.keys(carbonBySite).length}</div>
            <p className="text-xs text-muted-foreground">Delivery locations</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Carbon by Material Type */}
        <Card className="border-pathway-gold/20">
          <CardHeader>
            <CardTitle className="text-pathway-green">Carbon by Material Type</CardTitle>
            <CardDescription>Emissions breakdown by material category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(carbonByMaterialType)
                .sort(([, a], [, b]) => b - a)
                .map(([materialType, carbon]) => (
                  <div key={materialType} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-pathway-gold rounded-full"></div>
                      <span className="text-sm font-medium">{materialType}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{carbon.toFixed(1)} tCO₂e</div>
                      <div className="text-xs text-muted-foreground">{((carbon / totalCarbon) * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Carbon by Site */}
        <Card className="border-pathway-gold/20">
          <CardHeader>
            <CardTitle className="text-pathway-green">Carbon by Site</CardTitle>
            <CardDescription>Emissions breakdown by delivery location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(carbonBySite)
                .sort(([, a], [, b]) => b - a)
                .map(([site, carbon]) => (
                  <div key={site} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-pathway-gold" />
                      <span className="text-sm font-medium">{site}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{carbon.toFixed(1)} tCO₂e</div>
                      <div className="text-xs text-muted-foreground">{((carbon / totalCarbon) * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Carbon Over Time */}
        <Card className="border-pathway-gold/20 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-pathway-green">Carbon Over Time</CardTitle>
            <CardDescription>Monthly carbon emissions trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(carbonByMonth)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, carbon]) => (
                  <div key={month} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-pathway-gold" />
                      <span className="text-sm font-medium">
                        {new Date(month + "-01").toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                        })}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{carbon.toFixed(1)} tCO₂e</div>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-pathway-gold h-2 rounded-full"
                          style={{ width: `${(carbon / Math.max(...Object.values(carbonByMonth))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
