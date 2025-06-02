"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building, TrendingUp, Package, Calendar } from "lucide-react"

interface SuppliersViewProps {
  projectId: string
  deliveries: any[]
}

export function SuppliersView({ projectId, deliveries }: SuppliersViewProps) {
  // Group deliveries by supplier
  const supplierData = deliveries.reduce(
    (acc, delivery) => {
      const supplierName = delivery.supplier?.name || "Unknown Supplier"
      const supplierId = delivery.supplier?.id || "unknown"

      if (!acc[supplierId]) {
        acc[supplierId] = {
          name: supplierName,
          totalCarbon: 0,
          totalDeliveries: 0,
          totalValue: 0,
          materials: new Set(),
          contractors: new Set(),
          lastDelivery: null,
        }
      }

      acc[supplierId].totalCarbon += delivery.embodied_co2 || 0
      acc[supplierId].totalDeliveries += 1
      acc[supplierId].totalValue += delivery.total_cost || 0
      acc[supplierId].materials.add(delivery.material?.material_name || "Unknown")
      acc[supplierId].contractors.add(delivery.contractor?.name || "Unknown")

      const deliveryDate = new Date(delivery.delivery_date)
      if (!acc[supplierId].lastDelivery || deliveryDate > new Date(acc[supplierId].lastDelivery)) {
        acc[supplierId].lastDelivery = delivery.delivery_date
      }

      return acc
    },
    {} as Record<string, any>,
  )

  const suppliers = Object.values(supplierData).sort((a: any, b: any) => b.totalCarbon - a.totalCarbon)
  const totalProjectCarbon = deliveries.reduce((sum, d) => sum + (d.embodied_co2 || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-pathway-green">Suppliers View</h2>
        <p className="text-muted-foreground">Carbon emissions analysis by supplier</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-pathway-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pathway-green">Active Suppliers</CardTitle>
            <Building className="h-4 w-4 text-pathway-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pathway-green">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">Supplying materials</p>
          </CardContent>
        </Card>

        <Card className="border-pathway-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pathway-green">Top Supplier</CardTitle>
            <TrendingUp className="h-4 w-4 text-pathway-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-pathway-green truncate">{suppliers[0]?.name || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {suppliers[0] ? `${suppliers[0].totalCarbon.toFixed(1)} tCO₂e` : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-pathway-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pathway-green">Material Types</CardTitle>
            <Package className="h-4 w-4 text-pathway-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pathway-green">
              {suppliers.reduce((total: number, supplier: any) => total + supplier.materials.size, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all suppliers</p>
          </CardContent>
        </Card>

        <Card className="border-pathway-gold/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pathway-green">Total Value</CardTitle>
            <Calendar className="h-4 w-4 text-pathway-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pathway-green">
              ${suppliers.reduce((total: number, supplier: any) => total + supplier.totalValue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Material costs</p>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card className="border-pathway-gold/20">
        <CardHeader>
          <CardTitle className="text-pathway-green">Supplier Performance</CardTitle>
          <CardDescription>Carbon totals and delivery metrics by supplier</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Total Carbon</TableHead>
                <TableHead>% of Project</TableHead>
                <TableHead>Deliveries</TableHead>
                <TableHead>Materials</TableHead>
                <TableHead>Contractors</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Last Delivery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier: any, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell className="font-semibold">{supplier.totalCarbon.toFixed(1)} tCO₂e</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{((supplier.totalCarbon / totalProjectCarbon) * 100).toFixed(1)}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-pathway-gold h-2 rounded-full"
                          style={{ width: `${(supplier.totalCarbon / totalProjectCarbon) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{supplier.totalDeliveries}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-pathway-gold text-pathway-green">
                      {supplier.materials.size} types
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-pathway-gold text-pathway-green">
                      {supplier.contractors.size} contractors
                    </Badge>
                  </TableCell>
                  <TableCell>${supplier.totalValue.toLocaleString()}</TableCell>
                  <TableCell>
                    {supplier.lastDelivery ? new Date(supplier.lastDelivery).toLocaleDateString() : "N/A"}
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
