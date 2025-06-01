"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Upload, FileSpreadsheet, Truck, Calendar } from "lucide-react"

export default function DeliveriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const deliveries = [
    {
      id: 1,
      date: "2024-01-15",
      project: "Wastewater Treatment Plant A",
      material: "Concrete (40 MPa)",
      quantity: "125.5 m³",
      supplier: "ABC Concrete Co.",
      contractor: "BuildCorp Ltd.",
      emissions: "42.3 tCO₂e",
      costCode: "CC-001-STR",
      location: "Foundation Block A",
    },
    {
      id: 2,
      date: "2024-01-14",
      project: "Infrastructure Upgrade B",
      material: "Steel Reinforcement",
      quantity: "8.2 tonnes",
      supplier: "Steel Solutions",
      contractor: "MetalWorks Inc.",
      emissions: "18.7 tCO₂e",
      costCode: "CC-002-REI",
      location: "Structural Frame",
    },
  ]

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Deliveries</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search deliveries..." className="pl-8 w-64" />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Delivery
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Delivery</DialogTitle>
                <DialogDescription>
                  Add a single delivery or upload multiple deliveries via spreadsheet
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">Single Entry</TabsTrigger>
                  <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="project">Project</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="project1">Wastewater Treatment Plant A</SelectItem>
                          <SelectItem value="project2">Infrastructure Upgrade B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Delivery Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="material">Material</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concrete">Concrete (40 MPa)</SelectItem>
                          <SelectItem value="steel">Steel Reinforcement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input placeholder="e.g., 125.5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="abc">ABC Concrete Co.</SelectItem>
                          <SelectItem value="steel">Steel Solutions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contractor">Contractor</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contractor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buildcorp">BuildCorp Ltd.</SelectItem>
                          <SelectItem value="metalworks">MetalWorks Inc.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="costcode">Cost Code</Label>
                      <Input placeholder="e.g., CC-001-STR" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input placeholder="e.g., Foundation Block A" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsDialogOpen(false)}>Add Delivery</Button>
                  </div>
                </TabsContent>

                <TabsContent value="bulk" className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Upload Spreadsheet</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Drag and drop your Excel/CSV file here, or click to browse
                    </p>
                    <Button variant="outline" size="sm">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Or paste data directly:</Label>
                    <Textarea placeholder="Paste your delivery data here (CSV format)..." className="min-h-32" />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsDialogOpen(false)}>Process Upload</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4">
          {deliveries.map((delivery) => (
            <Card key={delivery.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      {delivery.material}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(delivery.date).toLocaleDateString()}
                      </span>
                      <span>{delivery.project}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{delivery.emissions}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Quantity</p>
                    <p className="font-semibold">{delivery.quantity}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Supplier</p>
                    <p className="font-semibold">{delivery.supplier}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Cost Code</p>
                    <p className="font-semibold">{delivery.costCode}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Location</p>
                    <p className="font-semibold">{delivery.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SidebarInset>
  )
}
