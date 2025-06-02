"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, TrendingUp, Calendar, Package } from "lucide-react"

interface ContractorsViewProps {
  projectId: string
  deliveries: any[]
}

export function ContractorsView({ projectId, deliveries }: ContractorsViewProps) {
  // Group deliveries by contractor
  const contractorData = deliveries.reduce(
    (acc, delivery) => {
      const contractorName = delivery.contractor?.name || "Unknown Contractor"
      const contractorId = delivery.contractor?.id || "unknown"

      if (!acc[contractorId]) {
        acc[contractorId] = {
          name: contractorName,
          totalCarbon: 0,
          totalDeliveries: 0,
          totalQuantity: 0,
          materials: new Set(),
          lastDelivery: null,
        }
      }

      acc[contractorId].totalCarbon += delivery.embodied_co2 || 0
      acc[contractorId].totalDeliveries += 1
      acc[contractorId].totalQuantity += delivery.quantity || 0
      acc[contractorId].materials.add(delivery.material?.material_name || "Unknown")

      const deliveryDate = new Date(delivery.delivery_date)
      if (!acc[contractorId].lastDelivery || deliveryDate > new Date(acc[contractorId].lastDelivery)) {
        acc[contractorId].lastDelivery = delivery.delivery_date
      }

      return acc
    },
    {} as Record<string, any>,
  )

  const contractors = Object.values(contractorData).sort((a: any, b: any) => b.totalCarbon - a.totalCarbon)
  const totalProjectCarbon = deliveries.reduce((sum, d) => sum + (d.embodied_co2 || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-pathway-green">Contractors View</h2>
        <p className="text-muted-foreground">Carbon emissions analysis by contractor</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-pathway-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pathway-green">Active Contractors</CardTitle>
            <Users className="h-4 w-4 text-pathway-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pathway-green">{contractors.length}</div>
            <p className="text-xs text-muted-foreground">Contributing to project</p>
          </CardContent>
        </Card>

        <Card className="border-pathway-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pathway-green">Top Contributor</CardTitle>
            <TrendingUp className="h-4 w-4 text-pathway-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-pathway-green truncate">{contractors[0]?.name || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {contractors[0] ? `${contractors[0].totalCarbon.toFixed(1)} tCO₂e` : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-pathway-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pathway-green">Avg per Contractor</CardTitle>
            <Package className="h-4 w-4 text-pathway-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pathway-green">
              {contractors.length > 0 ? (totalProjectCarbon / contractors.length).toFixed(1) : "0"} tCO₂e
            </div>
            <p className="text-xs text-muted-foreground">Average emissions</p>
          </CardContent>
        </Card>

        <Card className="border-pathway-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pathway-green">Recent Activity</CardTitle>
            <Calendar className="h-4 w-4 text-pathway-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pathway-green">
              {
                deliveries.filter((d) => {
                  const deliveryDate = new Date(d.delivery_date)
                  const oneWeekAgo = new Date()
                  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                  return deliveryDate >= oneWeekAgo
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Deliveries this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Contractors Table */}
      <Card className="border-pathway-gold/20">
        <CardHeader>
          <CardTitle className="text-pathway-green">Contractor Performance</CardTitle>
          <CardDescription>Carbon totals and delivery metrics by contractor</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contractor</TableHead>
                <TableHead>Total Carbon</TableHead>
                <TableHead>% of Project</TableHead>
                <TableHead>Deliveries</TableHead>
                <TableHead>Materials</TableHead>
                <TableHead>Last Delivery</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contractors.map((contractor: any, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{contractor.name}</TableCell>
                  <TableCell className="font-semibold">{contractor.totalCarbon.toFixed(1)} tCO₂e</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {((contractor.totalCarbon / totalProjectCarbon) * 100).toFixed(1)}%
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-pathway-gold h-2 rounded-full"
                          style={{ width: `${(contractor.totalCarbon / totalProjectCarbon) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{contractor.totalDeliveries}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-pathway-gold text-pathway-green">
                      {contractor.materials.size} types
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {contractor.lastDelivery ? new Date(contractor.lastDelivery).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        contractor.lastDelivery &&
                        new Date(contractor.lastDelivery) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                          ? "border-green-500 text-green-600"
                          : "border-gray-500 text-gray-600"
                      }
                    >
                      {contractor.lastDelivery &&
                      new Date(contractor.lastDelivery) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
