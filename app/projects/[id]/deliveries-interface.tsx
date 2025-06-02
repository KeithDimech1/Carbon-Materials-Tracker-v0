"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Upload, Trash2, Edit, Save, X } from "lucide-react"
import { BulkUploadTool } from "./bulk-upload-tool"

interface DeliveriesInterfaceProps {
  projectId: string
  deliveries: any[]
  costCodes: any[]
  locations: any[]
}

export function DeliveriesInterface({ projectId, deliveries, costCodes, locations }: DeliveriesInterfaceProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [newDeliveries, setNewDeliveries] = useState<any[]>([])

  // Sample data for dropdowns - in real app, these would come from API
  const contractors = [
    { id: 1, name: "BuildCorp Ltd." },
    { id: 2, name: "MetalWorks Inc." },
    { id: 3, name: "Concrete Solutions" },
  ]

  const materialTypes = [
    { id: 1, name: "Concrete" },
    { id: 2, name: "Steel" },
    { id: 3, name: "Timber" },
  ]

  const suppliers = [
    { id: 1, name: "ABC Concrete Co.", material_type_id: 1 },
    { id: 2, name: "Steel Solutions", material_type_id: 2 },
    { id: 3, name: "Timber Traders", material_type_id: 3 },
  ]

  const materials = [
    { id: 1, name: "40 MPa Concrete", supplier_id: 1, unit_id: 1 },
    { id: 2, name: "Steel Reinforcement", supplier_id: 2, unit_id: 2 },
    { id: 3, name: "Structural Timber", supplier_id: 3, unit_id: 3 },
  ]

  const units = [
    { id: 1, name: "cubic metres", symbol: "m³" },
    { id: 2, name: "tonnes", symbol: "t" },
    { id: 3, name: "linear metres", symbol: "m" },
  ]

  const australianPostcodes = [
    { postcode: "2000", suburb: "Sydney", state: "NSW" },
    { postcode: "3000", suburb: "Melbourne", state: "VIC" },
    { postcode: "4000", suburb: "Brisbane", state: "QLD" },
  ]

  const addNewRow = () => {
    const newRow = {
      id: Date.now(),
      contractor_id: "",
      delivery_date: "",
      location_id: "",
      cost_code_id: "",
      docket_number: "",
      material_type_id: "",
      supplier_id: "",
      material_id: "",
      unit_id: "",
      quantity: "",
      total_cost: "",
      material_description: "",
      origin_postcode: "",
    }
    setNewDeliveries([...newDeliveries, newRow])
    setEditingRow(newDeliveries.length)
  }

  const updateRow = (index: number, field: string, value: string) => {
    const updated = [...newDeliveries]
    updated[index] = { ...updated[index], [field]: value }
    setNewDeliveries(updated)
  }

  const deleteRow = (index: number) => {
    const updated = newDeliveries.filter((_, i) => i !== index)
    setNewDeliveries(updated)
    setEditingRow(null)
  }

  const saveRow = (index: number) => {
    // Here you would validate and save the row
    setEditingRow(null)
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-pathway-green">Deliveries Information</h2>
          <p className="text-muted-foreground">Manage delivery records for this project</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsBulkUploadOpen(true)}
            className="border-pathway-gold text-pathway-green hover:bg-pathway-green/10"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={addNewRow} className="bg-pathway-green hover:bg-pathway-green/90 text-pathway-cream">
            <Plus className="h-4 w-4 mr-2" />
            Add Delivery
          </Button>
        </div>
      </div>

      {/* Deliveries Table */}
      <Card className="border-pathway-gold/20">
        <CardHeader>
          <CardTitle className="text-pathway-green">Delivery Records</CardTitle>
          <CardDescription>{deliveries.length + newDeliveries.length} total deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Cost Code</TableHead>
                  <TableHead>Docket #</TableHead>
                  <TableHead>Material Type</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Existing deliveries */}
                {deliveries.map((delivery, index) => (
                  <TableRow key={delivery.delivery_id}>
                    <TableCell>{delivery.contractor?.name || "N/A"}</TableCell>
                    <TableCell>{new Date(delivery.delivery_date).toLocaleDateString()}</TableCell>
                    <TableCell>{delivery.location?.location_name || "N/A"}</TableCell>
                    <TableCell>{delivery.cost_code?.cost_code_name || "N/A"}</TableCell>
                    <TableCell>{delivery.docket_number || "N/A"}</TableCell>
                    <TableCell>{delivery.material?.material_type?.name || "N/A"}</TableCell>
                    <TableCell>{delivery.supplier?.name || "N/A"}</TableCell>
                    <TableCell>{delivery.material?.material_name || "N/A"}</TableCell>
                    <TableCell>{delivery.unit?.symbol || "N/A"}</TableCell>
                    <TableCell>{delivery.quantity}</TableCell>
                    <TableCell>{delivery.total_cost ? `$${delivery.total_cost}` : "N/A"}</TableCell>
                    <TableCell>{delivery.origin?.suburb || "N/A"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {/* New deliveries being added */}
                {newDeliveries.map((delivery, index) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      {editingRow === index ? (
                        <Select
                          value={delivery.contractor_id}
                          onValueChange={(value) => updateRow(index, "contractor_id", value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {contractors.map((contractor) => (
                              <SelectItem key={contractor.id} value={contractor.id.toString()}>
                                {contractor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        contractors.find((c) => c.id.toString() === delivery.contractor_id)?.name || "Select contractor"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === index ? (
                        <Input
                          type="date"
                          value={delivery.delivery_date}
                          onChange={(e) => updateRow(index, "delivery_date", e.target.value)}
                          className="w-32"
                        />
                      ) : (
                        delivery.delivery_date || "Select date"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === index ? (
                        <Select
                          value={delivery.location_id}
                          onValueChange={(value) => updateRow(index, "location_id", value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location.location_id} value={location.location_id.toString()}>
                                {location.location_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        locations.find((l) => l.location_id.toString() === delivery.location_id)?.location_name ||
                        "Select site"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === index ? (
                        <Select
                          value={delivery.cost_code_id}
                          onValueChange={(value) => updateRow(index, "cost_code_id", value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {costCodes.map((code) => (
                              <SelectItem key={code.cost_code_id} value={code.cost_code_id.toString()}>
                                {code.cost_code_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        costCodes.find((c) => c.cost_code_id.toString() === delivery.cost_code_id)?.cost_code_name ||
                        "Select code"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === index ? (
                        <Input
                          value={delivery.docket_number}
                          onChange={(e) => updateRow(index, "docket_number", e.target.value)}
                          className="w-24"
                          placeholder="Docket #"
                        />
                      ) : (
                        delivery.docket_number || "Enter docket"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === index ? (
                        <Select
                          value={delivery.material_type_id}
                          onValueChange={(value) => updateRow(index, "material_type_id", value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        materialTypes.find((t) => t.id.toString() === delivery.material_type_id)?.name || "Select type"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === index ? (
                        <Select
                          value={delivery.supplier_id}
                          onValueChange={(value) => updateRow(index, "supplier_id", value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers
                              .filter(
                                (s) =>
                                  !delivery.material_type_id ||
                                  s.material_type_id.toString() === delivery.material_type_id,
                              )
                              .map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        suppliers.find((s) => s.id.toString() === delivery.supplier_id)?.name || "Select supplier"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === index ? (
                        <Select
                          value={delivery.material_id}
                          onValueChange={(value) => updateRow(index, "material_id", value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {materials
                              .filter((m) => !delivery.supplier_id || m.supplier_id.toString() === delivery.supplier_id)
                              .map((material) => (
                                <SelectItem key={material.id} value={material.id.toString()}>
                                  {material.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        materials.find((m) => m.id.toString() === delivery.material_id)?.name || "Select material"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === index ? (
                        <Select value={delivery.unit_id} onValueChange={(value) => updateRow(index, "unit_id", value)}>
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id.toString()}>
                                {unit.symbol}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        units.find((u) => u.id.toString() === delivery.unit_id)?.symbol || "Unit"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === index ? (
                        <Input
                          type="number"
                          value={delivery.quantity}
                          onChange={(e) => updateRow(index, "quantity", e.target.value)}
                          className="w-20"
                          placeholder="Qty"
                        />
                      ) : (
                        delivery.quantity || "Enter qty"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === index ? (
                        <Input
                          type="number"
                          value={delivery.total_cost}
                          onChange={(e) => updateRow(index, "total_cost", e.target.value)}
                          className="w-24"
                          placeholder="Cost"
                        />
                      ) : delivery.total_cost ? (
                        `$${delivery.total_cost}`
                      ) : (
                        "Enter cost"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === index ? (
                        <Select
                          value={delivery.origin_postcode}
                          onValueChange={(value) => updateRow(index, "origin_postcode", value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Origin" />
                          </SelectTrigger>
                          <SelectContent>
                            {australianPostcodes.map((location) => (
                              <SelectItem key={location.postcode} value={location.postcode}>
                                {location.postcode} - {location.suburb}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        australianPostcodes.find((l) => l.postcode === delivery.origin_postcode)?.suburb ||
                        "Select origin"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {editingRow === index ? (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => saveRow(index)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingRow(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => setEditingRow(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteRow(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
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

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent className="max-w-4xl border-pathway-gold/30">
          <DialogHeader>
            <DialogTitle className="text-pathway-green">Bulk Upload Deliveries</DialogTitle>
            <DialogDescription className="text-pathway-green/70">
              Upload delivery records from CSV files with column mapping
            </DialogDescription>
          </DialogHeader>
          <BulkUploadTool projectId={projectId} onClose={() => setIsBulkUploadOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
