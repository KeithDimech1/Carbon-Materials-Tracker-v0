"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, X } from "lucide-react"
import { getRawDeliveries, resolveRawDelivery, getLookupData } from "@/app/actions/bulk-deliveries"

interface DeliveryErrorsProps {
  projectId: string
}

export function DeliveryErrors({ projectId }: DeliveryErrorsProps) {
  const [rawDeliveries, setRawDeliveries] = useState<any[]>([])
  const [lookupData, setLookupData] = useState<any>(null)
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [resolutionData, setResolutionData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const [rawData, lookup] = await Promise.all([getRawDeliveries(projectId), getLookupData(projectId)])
      setRawDeliveries(rawData)
      setLookupData(lookup)
    } catch (error) {
      console.error("Error loading delivery errors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (rawDeliveryId: string) => {
    const resolution = resolutionData[rawDeliveryId]
    if (!resolution) return

    try {
      const result = await resolveRawDelivery(rawDeliveryId, resolution)
      if (result.success) {
        // Refresh the data
        await loadData()
        setEditingRow(null)
        setResolutionData((prev) => {
          const updated = { ...prev }
          delete updated[rawDeliveryId]
          return updated
        })
      } else {
        alert(`Failed to resolve delivery: ${result.error}`)
      }
    } catch (error) {
      console.error("Error resolving delivery:", error)
      alert("Failed to resolve delivery. Please try again.")
    }
  }

  const updateResolution = (rawDeliveryId: string, field: string, value: string) => {
    setResolutionData((prev) => ({
      ...prev,
      [rawDeliveryId]: {
        ...prev[rawDeliveryId],
        [field]: value,
      },
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading delivery errors...</div>
        </CardContent>
      </Card>
    )
  }

  if (rawDeliveries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Delivery Errors
          </CardTitle>
          <CardDescription>No delivery errors found - all uploads were successful!</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Delivery Errors ({rawDeliveries.length})
        </CardTitle>
        <CardDescription>Review and resolve delivery entries that couldn't be automatically processed</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Contractor</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Errors</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawDeliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>{delivery.delivery_date || "N/A"}</TableCell>
                  <TableCell>
                    {editingRow === delivery.id ? (
                      <Select
                        value={resolutionData[delivery.id]?.contractor_id || ""}
                        onValueChange={(value) => updateResolution(delivery.id, "contractor_id", value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select contractor" />
                        </SelectTrigger>
                        <SelectContent>
                          {lookupData?.contractors.map((contractor: any) => (
                            <SelectItem key={contractor.id} value={contractor.id}>
                              {contractor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div>
                        <div className="font-medium">{delivery.contractor_name || "N/A"}</div>
                        {delivery.contractor_id && (
                          <Badge variant="outline" className="text-xs">
                            Matched
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRow === delivery.id ? (
                      <Select
                        value={resolutionData[delivery.id]?.material_id || ""}
                        onValueChange={(value) => updateResolution(delivery.id, "material_id", value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {lookupData?.materials.map((material: any) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div>
                        <div className="font-medium">{delivery.material_name || "N/A"}</div>
                        {delivery.material_id && (
                          <Badge variant="outline" className="text-xs">
                            Matched
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRow === delivery.id ? (
                      <Select
                        value={resolutionData[delivery.id]?.supplier_id || ""}
                        onValueChange={(value) => updateResolution(delivery.id, "supplier_id", value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {lookupData?.suppliers.map((supplier: any) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div>
                        <div className="font-medium">{delivery.supplier_name || "N/A"}</div>
                        {delivery.supplier_id && (
                          <Badge variant="outline" className="text-xs">
                            Matched
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{delivery.quantity || "N/A"}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {delivery.validation_errors?.map((error: string, index: number) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {error}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {editingRow === delivery.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(delivery.id)}
                            disabled={
                              !resolutionData[delivery.id]?.contractor_id ||
                              !resolutionData[delivery.id]?.material_id ||
                              !resolutionData[delivery.id]?.supplier_id
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingRow(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setEditingRow(delivery.id)}>
                          Resolve
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
