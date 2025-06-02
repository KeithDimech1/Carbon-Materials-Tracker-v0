"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Calendar, Package, Building, Users } from "lucide-react"

interface MonthlyDeliveriesTableProps {
  projectId: string
  deliveries: any[]
}

interface HierarchyNode {
  id: string
  name: string
  type: "contractor" | "supplier" | "materialType" | "material" | "unit"
  monthlyData: Record<string, { quantity: number; carbon: number }>
  children: HierarchyNode[]
  isExpanded?: boolean
}

export function MonthlyDeliveriesTable({ projectId, deliveries }: MonthlyDeliveriesTableProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Get unique months from deliveries
  const months = Array.from(
    new Set(
      deliveries.map((d) => {
        const date = new Date(d.delivery_date)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      }),
    ),
  ).sort()

  // Build hierarchical structure: Contractor → Supplier → Material Type → Material → Unit
  const buildHierarchy = (): HierarchyNode[] => {
    const contractorMap = new Map<string, HierarchyNode>()

    deliveries.forEach((delivery) => {
      const contractorId = delivery.contractor?.id || "unknown"
      const contractorName = delivery.contractor?.name || "Unknown Contractor"
      const supplierId = delivery.supplier?.id || "unknown"
      const supplierName = delivery.supplier?.name || "Unknown Supplier"
      const materialTypeId = delivery.material?.material_type?.id || "unknown"
      const materialTypeName = delivery.material?.material_type?.name || "Unknown Type"
      const materialId = delivery.material?.id || "unknown"
      const materialName = delivery.material?.material_name || "Unknown Material"
      const unitId = delivery.unit?.id || "unknown"
      const unitName = delivery.unit?.symbol || "Unknown Unit"

      const date = new Date(delivery.delivery_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const quantity = delivery.quantity || 0
      const carbon = delivery.embodied_co2 || 0

      // Get or create contractor
      if (!contractorMap.has(contractorId)) {
        contractorMap.set(contractorId, {
          id: contractorId,
          name: contractorName,
          type: "contractor",
          monthlyData: {},
          children: [],
        })
      }
      const contractor = contractorMap.get(contractorId)!

      // Update contractor monthly data
      if (!contractor.monthlyData[monthKey]) {
        contractor.monthlyData[monthKey] = { quantity: 0, carbon: 0 }
      }
      contractor.monthlyData[monthKey].quantity += quantity
      contractor.monthlyData[monthKey].carbon += carbon

      // Get or create supplier under contractor
      let supplier = contractor.children.find((c) => c.id === supplierId)
      if (!supplier) {
        supplier = {
          id: supplierId,
          name: supplierName,
          type: "supplier",
          monthlyData: {},
          children: [],
        }
        contractor.children.push(supplier)
      }

      // Update supplier monthly data
      if (!supplier.monthlyData[monthKey]) {
        supplier.monthlyData[monthKey] = { quantity: 0, carbon: 0 }
      }
      supplier.monthlyData[monthKey].quantity += quantity
      supplier.monthlyData[monthKey].carbon += carbon

      // Get or create material type under supplier
      let materialType = supplier.children.find((c) => c.id === materialTypeId)
      if (!materialType) {
        materialType = {
          id: materialTypeId,
          name: materialTypeName,
          type: "materialType",
          monthlyData: {},
          children: [],
        }
        supplier.children.push(materialType)
      }

      // Update material type monthly data
      if (!materialType.monthlyData[monthKey]) {
        materialType.monthlyData[monthKey] = { quantity: 0, carbon: 0 }
      }
      materialType.monthlyData[monthKey].quantity += quantity
      materialType.monthlyData[monthKey].carbon += carbon

      // Get or create material under material type
      let material = materialType.children.find((c) => c.id === materialId)
      if (!material) {
        material = {
          id: materialId,
          name: materialName,
          type: "material",
          monthlyData: {},
          children: [],
        }
        materialType.children.push(material)
      }

      // Update material monthly data
      if (!material.monthlyData[monthKey]) {
        material.monthlyData[monthKey] = { quantity: 0, carbon: 0 }
      }
      material.monthlyData[monthKey].quantity += quantity
      material.monthlyData[monthKey].carbon += carbon

      // Get or create unit under material
      let unit = material.children.find((c) => c.id === unitId)
      if (!unit) {
        unit = {
          id: unitId,
          name: unitName,
          type: "unit",
          monthlyData: {},
          children: [],
        }
        material.children.push(unit)
      }

      // Update unit monthly data
      if (!unit.monthlyData[monthKey]) {
        unit.monthlyData[monthKey] = { quantity: 0, carbon: 0 }
      }
      unit.monthlyData[monthKey].quantity += quantity
      unit.monthlyData[monthKey].carbon += carbon
    })

    return Array.from(contractorMap.values())
  }

  const hierarchy = buildHierarchy()

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "contractor":
        return <Users className="h-4 w-4" />
      case "supplier":
        return <Building className="h-4 w-4" />
      case "materialType":
        return <Package className="h-4 w-4" />
      case "material":
        return <Package className="h-4 w-4" />
      case "unit":
        return <Calendar className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "contractor":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "supplier":
        return "bg-green-100 text-green-800 border-green-200"
      case "materialType":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "material":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "unit":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const renderNode = (node: HierarchyNode, depth = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children.length > 0
    const paddingLeft = depth * 24

    return (
      <div key={node.id}>
        <div
          className="flex items-center py-2 px-4 hover:bg-gray-50 border-b border-gray-100"
          style={{ paddingLeft: paddingLeft + 16 }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {hasChildren && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleExpanded(node.id)}>
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            )}
            {!hasChildren && <div className="w-6" />}

            <div className="flex items-center gap-2 min-w-0">
              {getIcon(node.type)}
              <span className="font-medium truncate">{node.name}</span>
              <Badge variant="outline" className={getTypeColor(node.type)}>
                {node.type}
              </Badge>
            </div>
          </div>

          {/* Monthly data columns */}
          <div className="flex gap-4 ml-4">
            {months.map((month) => {
              const data = node.monthlyData[month]
              return (
                <div key={month} className="text-center min-w-[100px]">
                  {data ? (
                    <div>
                      <div className="text-sm font-semibold">{data.quantity.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">{data.carbon.toFixed(1)} tCO₂e</div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">-</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-pathway-green">Monthly Deliveries Table</h2>
        <p className="text-muted-foreground">
          Hierarchical view of deliveries by contractor, supplier, material type, material, and unit
        </p>
      </div>

      <Card className="border-pathway-gold/20">
        <CardHeader>
          <CardTitle className="text-pathway-green">Hierarchical Monthly View</CardTitle>
          <CardDescription>
            Contractor → Supplier → Material Type → Material → Unit structure with monthly totals
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* Header */}
            <div className="flex items-center py-3 px-4 bg-gray-50 border-b font-medium">
              <div className="flex-1">Structure</div>
              <div className="flex gap-4 ml-4">
                {months.map((month) => (
                  <div key={month} className="text-center min-w-[100px]">
                    <div className="text-sm font-semibold">
                      {new Date(month + "-01").toLocaleDateString("en-US", {
                        month: "short",
                        year: "2-digit",
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">Qty / Carbon</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hierarchy */}
            <div className="max-h-[600px] overflow-y-auto">{hierarchy.map((node) => renderNode(node))}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
