"use client"

import type React from "react"

import { useState, useRef } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Package,
  Truck,
  FileText,
  Download,
  Upload,
  Plus,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { bulkCreateCostCodes } from "@/app/actions/cost-codes"

// Helper component for missing table messages
function MissingTableMessage({ tableName, onDownloadTemplate }: { tableName: string; onDownloadTemplate: () => void }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Table Not Set Up</h3>
          <p className="text-muted-foreground mb-4">
            The {tableName} table doesn't exist in your database yet. Download a template to get started.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={onDownloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Bulk Upload Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

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

// Helper function to get date from project data
function getProjectDate(project: any): string | null {
  const dateColumns = ["start_date", "created_date", "date", "timestamp"]
  for (const col of dateColumns) {
    if (col in project && project[col]) {
      return project[col]
    }
  }
  return null
}

// CSV utility functions
function downloadCSV(data: any[], filename: string, headers: string[]) {
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          // Map the display headers to actual data fields
          let value = ""
          if (header === "Cost Code Number") {
            value = row.cost_code_number || ""
          } else if (header === "Cost Code Name") {
            value = row.cost_code_name || ""
          } else if (header === "Description") {
            value = row.description || ""
          }
          return `"${value}"`
        })
        .join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function parseCSV(csvText: string): any[] {
  const lines = csvText.split("\n").filter((line) => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())
  const data = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim())
    const row: any = {}
    headers.forEach((header, index) => {
      // Map CSV headers to database field names
      if (header === "Cost Code Number") {
        row.cost_code_number = values[index] || ""
      } else if (header === "Cost Code Name") {
        row.cost_code_name = values[index] || ""
      } else if (header === "Description") {
        row.description = values[index] || ""
      }
    })
    data.push(row)
  }

  return data
}

interface ProjectDetailsClientProps {
  project: any
  deliveries: any[]
  costCodes: any[]
  locations: any[]
}

export function ProjectDetailsClient({ project, deliveries, costCodes, locations }: ProjectDetailsClientProps) {
  const [isAddCostCodeOpen, setIsAddCostCodeOpen] = useState(false)
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false)
  const [isUploadCostCodesOpen, setIsUploadCostCodesOpen] = useState(false)
  const [isUploadLocationsOpen, setIsUploadLocationsOpen] = useState(false)
  const costCodeFileRef = useRef<HTMLInputElement>(null)
  const locationFileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const totalEmissions = deliveries.reduce((sum, delivery) => sum + getEmissionsFromDelivery(delivery), 0)
  const projectDate = getProjectDate(project)

  // Cost Code CSV functions
  const downloadCostCodesCSV = () => {
    const headers = ["Cost Code Number", "Cost Code Name", "Description"]
    const data = costCodes.length > 0 ? costCodes : [{ cost_code_number: "", cost_code_name: "", description: "" }]
    downloadCSV(data, `cost_codes_${project.name.replace(/\s+/g, "_")}.csv`, headers)
  }

  const handleCostCodeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const csvText = e.target?.result as string
        const parsedData = parseCSV(csvText)

        if (parsedData.length === 0) {
          toast({
            title: "Upload Error",
            description: "No valid data found in CSV file.",
            variant: "destructive",
          })
          return
        }

        // Upload to database
        const result = await bulkCreateCostCodes(project.project_id.toString(), parsedData)

        if (result.success) {
          toast({
            title: "Cost Codes Uploaded",
            description: `Successfully uploaded ${parsedData.length} cost codes.`,
          })
          // Refresh the page to show new data
          window.location.reload()
        } else {
          toast({
            title: "Upload Error",
            description: result.error || "Failed to upload cost codes.",
            variant: "destructive",
          })
        }

        setIsUploadCostCodesOpen(false)
      } catch (error) {
        toast({
          title: "Upload Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  // Location CSV functions
  const downloadLocationsCSV = () => {
    const headers = ["Name", "Description", "Coordinates"]
    const data = locations.length > 0 ? locations : [{ name: "", description: "", coordinates: "" }]
    downloadCSV(data, `locations_${project.name.replace(/\s+/g, "_")}.csv`, headers)
  }

  const handleLocationUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        const parsedData = parseCSV(csvText)
        console.log("Parsed locations:", parsedData)
        toast({
          title: "CSV Uploaded",
          description: `Parsed ${parsedData.length} location records. Ready for processing.`,
        })
        setIsUploadLocationsOpen(false)
      } catch (error) {
        toast({
          title: "Upload Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">{project.name}</h1>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {/* Project Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {project.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  {project.latitude && project.longitude && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {project.latitude.toFixed(4)}, {project.longitude.toFixed(4)}
                    </span>
                  )}
                  {projectDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(projectDate).toLocaleDateString()}
                    </span>
                  )}
                  {project.project_number && (
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{project.project_number}</span>
                  )}
                </CardDescription>
              </div>
              <Badge variant="secondary">{project.status_name || "Planning"}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {project.Description && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{project.Description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Emissions</p>
                <p className="text-2xl font-bold">{(totalEmissions / 1000).toFixed(1)} tCO₂e</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deliveries</p>
                <p className="text-2xl font-bold">{deliveries.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost Codes</p>
                <p className="text-2xl font-bold">{costCodes.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Locations</p>
                <p className="text-2xl font-bold">{locations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="deliveries" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="cost-codes">Cost Codes</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>

          <TabsContent value="deliveries" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Project Deliveries</h3>
              <Button size="sm">
                <Truck className="h-4 w-4 mr-2" />
                Add Delivery
              </Button>
            </div>
            {deliveries.length > 0 ? (
              <div className="grid gap-4">
                {deliveries.map((delivery) => (
                  <Card key={delivery.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Material</p>
                          <p className="font-semibold">{delivery.material_name || delivery.material_id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                          <p className="font-semibold">{delivery.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Delivery Date</p>
                          <p className="font-semibold">
                            {delivery.delivery_date ? new Date(delivery.delivery_date).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Emissions</p>
                          <p className="font-semibold text-orange-600">
                            {(getEmissionsFromDelivery(delivery) / 1000).toFixed(1)} tCO₂e
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Deliveries</h3>
                    <p className="text-muted-foreground mb-4">No deliveries have been recorded for this project.</p>
                    <Button>
                      <Truck className="h-4 w-4 mr-2" />
                      Add First Delivery
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Materials Used</h3>
              <Button size="sm">
                <Package className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </div>
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Materials Summary</h3>
                  <p className="text-muted-foreground">Material usage will be calculated from deliveries.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cost-codes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Cost Codes</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadCostCodesCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Bulk Upload Template
                </Button>
                <Dialog open={isUploadCostCodesOpen} onOpenChange={setIsUploadCostCodesOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Upload Cost Codes</DialogTitle>
                      <DialogDescription>
                        Upload a CSV file with cost codes. The file should have columns: Cost Code Number, Cost Code
                        Name, Description
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="costcode-file">Select CSV File</Label>
                        <Input
                          id="costcode-file"
                          type="file"
                          accept=".csv"
                          ref={costCodeFileRef}
                          onChange={handleCostCodeUpload}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isAddCostCodeOpen} onOpenChange={setIsAddCostCodeOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Cost Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Cost Code</DialogTitle>
                      <DialogDescription>Add a new cost code for this project</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cost_code_number">Cost Code Number</Label>
                        <Input id="cost_code_number" placeholder="e.g., CC-001" />
                      </div>
                      <div>
                        <Label htmlFor="cost_code_name">Cost Code Name</Label>
                        <Input id="cost_code_name" placeholder="e.g., Structural Foundation" />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Cost code description" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddCostCodeOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setIsAddCostCodeOpen(false)}>Add Cost Code</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            {costCodes === null ? (
              <MissingTableMessage tableName="cost codes" onDownloadTemplate={downloadCostCodesCSV} />
            ) : costCodes.length > 0 ? (
              <div className="grid gap-4">
                {costCodes.map((costCode) => (
                  <Card key={costCode.cost_code_id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Cost Code Number</p>
                          <p className="font-semibold font-mono">{costCode.cost_code_number || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Cost Code Name</p>
                          <p className="font-semibold">{costCode.cost_code_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Description</p>
                          <p className="font-semibold">{costCode.description || "No description"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Cost Codes</h3>
                    <p className="text-muted-foreground mb-4">No cost codes have been defined for this project.</p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={downloadCostCodesCSV} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Bulk Upload Template
                      </Button>
                      <Button onClick={() => setIsAddCostCodeOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Cost Code
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Project Locations</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadLocationsCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Bulk Upload Template
                </Button>
                <Dialog open={isUploadLocationsOpen} onOpenChange={setIsUploadLocationsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Upload Locations</DialogTitle>
                      <DialogDescription>
                        Upload a CSV file with locations. The file should have columns: Name, Description, Coordinates
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="location-file">Select CSV File</Label>
                        <Input
                          id="location-file"
                          type="file"
                          accept=".csv"
                          ref={locationFileRef}
                          onChange={handleLocationUpload}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Location</DialogTitle>
                      <DialogDescription>Add a new location for this project</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="e.g., Foundation Block A" />
                      </div>
                      <div>
                        <Label htmlFor="coordinates">Coordinates</Label>
                        <Input id="coordinates" placeholder="e.g., 51.505,-0.09" />
                      </div>
                      <div>
                        <Label htmlFor="location-description">Description</Label>
                        <Textarea id="location-description" placeholder="Location description" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddLocationOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setIsAddLocationOpen(false)}>Add Location</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            {locations === null ? (
              <MissingTableMessage tableName="locations" onDownloadTemplate={downloadLocationsCSV} />
            ) : locations.length > 0 ? (
              <div className="grid gap-4">
                {locations.map((location) => (
                  <Card key={location.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Name</p>
                          <p className="font-semibold">{location.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Coordinates</p>
                          <p className="font-semibold font-mono">{location.coordinates || "Not specified"}</p>
                        </div>
                        {location.description && (
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">Description</p>
                            <p className="text-sm">{location.description}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Locations</h3>
                    <p className="text-muted-foreground mb-4">
                      No specific locations have been defined for this project.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={downloadLocationsCSV} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Bulk Upload Template
                      </Button>
                      <Button onClick={() => setIsAddLocationOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Location
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={costCodeFileRef}
        style={{ display: "none" }}
        accept=".csv"
        onChange={handleCostCodeUpload}
      />
      <input
        type="file"
        ref={locationFileRef}
        style={{ display: "none" }}
        accept=".csv"
        onChange={handleLocationUpload}
      />
    </SidebarInset>
  )
}
