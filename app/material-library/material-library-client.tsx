"use client"

import type React from "react"

import { useState, useRef, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { validateMaterialCSV, importMaterials } from "@/app/actions/materials"
import { Package, Upload, FileSpreadsheet, Check, X, AlertCircle, Settings, Search, Filter } from "lucide-react"

interface MaterialLibraryClientProps {
  materials: any[]
}

export function MaterialLibraryClient({ materials = [] }: MaterialLibraryClientProps) {
  const { toast } = useToast()
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importStep, setImportStep] = useState<"upload" | "mapping" | "importing" | "results">("upload")
  const [csvContent, setCsvContent] = useState<string>("")
  const [csvValidation, setCsvValidation] = useState<any>(null)
  const [fieldMapping, setFieldMapping] = useState<any>({})
  const [importResults, setImportResults] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMaterialType, setSelectedMaterialType] = useState<string>("all")
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all")
  const [selectedEmissionSource, setSelectedEmissionSource] = useState<string>("all")

  // Get unique values for filters
  const { materialTypes, suppliers, emissionSources } = useMemo(() => {
    const types = new Set<string>()
    const supplierSet = new Set<string>()
    const sources = new Set<string>()

    materials.forEach((material) => {
      if (material.material_type) {
        types.add(material.material_type)
      }
      if (material.supplier) {
        supplierSet.add(material.supplier)
      }
      if (material.emission_source) {
        sources.add(material.emission_source)
      }
    })

    return {
      materialTypes: Array.from(types).sort(),
      suppliers: Array.from(supplierSet).sort(),
      emissionSources: Array.from(sources).sort(),
    }
  }, [materials])

  // Filter materials based on search and filters
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        material.material_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.material_type?.toLowerCase().includes(searchTerm.toLowerCase())

      // Material type filter
      const matchesType = selectedMaterialType === "all" || material.material_type === selectedMaterialType

      // Supplier filter
      const matchesSupplier = selectedSupplier === "all" || material.supplier === selectedSupplier

      // Emission source filter
      const matchesSource = selectedEmissionSource === "all" || material.emission_source === selectedEmissionSource

      return matchesSearch && matchesType && matchesSupplier && matchesSource
    })
  }, [materials, searchTerm, selectedMaterialType, selectedSupplier, selectedEmissionSource])

  // Filter materials for recent tab - only show those with date_added
  const recentMaterials = useMemo(() => {
    return materials
      .filter((material) => material.date_added)
      .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
      .slice(0, 20) // Show last 20 recent materials
  }, [materials])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setCsvContent(text)

      // Validate the CSV
      const validation = await validateMaterialCSV(text)
      if (validation.success) {
        setCsvValidation(validation)
        setFieldMapping(validation.suggestedMapping)
        setImportStep("mapping")
      } else {
        toast({
          title: "CSV Validation Error",
          description: validation.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error Reading File",
        description: "Failed to read the CSV file. Please check the file format.",
        variant: "destructive",
      })
    }
  }

  const handlePasteCSV = async (text: string) => {
    setCsvContent(text)

    // Validate the CSV
    const validation = await validateMaterialCSV(text)
    if (validation.success) {
      setCsvValidation(validation)
      setFieldMapping(validation.suggestedMapping)
      setImportStep("mapping")
    } else {
      toast({
        title: "CSV Validation Error",
        description: validation.error,
        variant: "destructive",
      })
    }
  }

  const updateFieldMapping = (
    header: string,
    type: "core" | "attribute" | "ignore",
    targetField?: string,
    unitId?: string,
  ) => {
    setFieldMapping((prev) => ({
      ...prev,
      [header]: {
        fieldType: type,
        targetField,
        unitId,
      },
    }))
  }

  const handleImport = async () => {
    setImportStep("importing")

    try {
      const result = await importMaterials(csvContent, fieldMapping)

      if (result.success) {
        setImportResults(result.results)
        setImportStep("results")

        if (result.results.failed === 0) {
          toast({
            title: "Import Successful",
            description: `Successfully imported ${result.results.success} materials.`,
          })
        } else {
          toast({
            title: "Import Completed with Errors",
            description: `Imported ${result.results.success} materials, ${result.results.failed} failed.`,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Import Failed",
          description: result.error,
          variant: "destructive",
        })
        setImportStep("mapping")
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "An unexpected error occurred during import.",
        variant: "destructive",
      })
      setImportStep("mapping")
    }
  }

  const resetImport = () => {
    setCsvContent("")
    setCsvValidation(null)
    setFieldMapping({})
    setImportResults(null)
    setImportStep("upload")
  }

  const closeDialog = () => {
    setIsImportDialogOpen(false)
    // Reset after a short delay to avoid UI flicker
    setTimeout(resetImport, 300)
  }

  const downloadSampleCSV = () => {
    const headers = ["Material Name", "Material Type", "Supplier", "Unit", "Embodied CO2", "Evidence URL"]

    const sampleData = [
      ["Portland Cement", "Cement", "ABC Cement Co", "kg", "0.95", "https://example.com/cement-data"],
      ["Recycled Steel", "Metal", "XYZ Steel", "kg", "0.75", "https://example.com/steel-data"],
    ]

    const csvContent = [headers.join(","), ...sampleData.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "sample_materials.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedMaterialType("all")
    setSelectedSupplier("all")
    setSelectedEmissionSource("all")
  }

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedMaterialType !== "all" ||
    selectedSupplier !== "all" ||
    selectedEmissionSource !== "all"

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-pathway-green">Material Library</h2>
          <p className="text-muted-foreground">Manage your materials and their emission factors</p>
        </div>
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pathway-green hover:bg-pathway-green/90 text-pathway-cream">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import Materials
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Bulk Import Materials</DialogTitle>
              <DialogDescription>
                Upload a CSV file with material data to import into the material library
              </DialogDescription>
            </DialogHeader>

            {importStep === "upload" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Upload CSV File</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <input type="file" ref={fileInputRef} accept=".csv" className="hidden" onChange={handleFileChange} />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Or paste CSV data:</Label>
                  <textarea
                    className="w-full min-h-32 p-2 border rounded-md"
                    placeholder="Paste your CSV data here..."
                    onChange={(e) => {
                      if (e.target.value.trim()) {
                        handlePasteCSV(e.target.value)
                      }
                    }}
                  />
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <Button variant="outline" onClick={downloadSampleCSV}>
                    Download Sample CSV
                  </Button>
                  <Button variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {importStep === "mapping" && csvValidation && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">CSV Preview</h3>
                    <Badge variant="outline">{csvValidation.totalRows} rows</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {csvValidation.headers.map((header: string) => (
                            <TableHead key={header}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvValidation.sampleRows.map((row: any, i: number) => (
                          <TableRow key={i}>
                            {csvValidation.headers.map((header: string) => (
                              <TableCell key={`${i}-${header}`}>{row[header]}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Field Mapping</h3>
                  <p className="text-sm text-muted-foreground mb-4">Map each CSV column to a material field</p>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {csvValidation.headers.map((header: string) => {
                      const mapping = fieldMapping[header] || { fieldType: "ignore" }

                      return (
                        <div key={header} className="flex items-center gap-2 p-2 border rounded-md">
                          <div className="font-medium w-1/4 truncate" title={header}>
                            {header}
                          </div>

                          <Select
                            value={mapping.fieldType}
                            onValueChange={(value) =>
                              updateFieldMapping(
                                header,
                                value as "core" | "attribute" | "ignore",
                                mapping.targetField,
                                mapping.unitId,
                              )
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="core">Core Field</SelectItem>
                              <SelectItem value="ignore">Ignore</SelectItem>
                            </SelectContent>
                          </Select>

                          {mapping.fieldType === "core" && (
                            <Select
                              value={mapping.targetField || "default"}
                              onValueChange={(value) => updateFieldMapping(header, "core", value, mapping.unitId)}
                            >
                              <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="material_name">Material Name</SelectItem>
                                <SelectItem value="embodied_co2_t_per_unit">Embodied CO2 (t/unit)</SelectItem>
                                <SelectItem value="material_evidence_url">Evidence URL</SelectItem>
                                <SelectItem value="material_type_id">Material Type</SelectItem>
                                <SelectItem value="material_subtype_id">Material Subtype</SelectItem>
                                <SelectItem value="supplier_id">Supplier</SelectItem>
                                <SelectItem value="unit_id">Unit</SelectItem>
                                <SelectItem value="generic_material_id">Generic Material</SelectItem>
                                <SelectItem value="transport_mode_id">Transport Mode</SelectItem>
                                <SelectItem value="emission_source_id">Emission Source</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <Button variant="outline" onClick={() => setImportStep("upload")}>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                    <Button onClick={handleImport}>Import Materials</Button>
                  </div>
                </div>
              </div>
            )}

            {importStep === "importing" && (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pathway-green mx-auto mb-4"></div>
                <h3 className="text-lg font-medium mb-2">Importing Materials</h3>
                <p className="text-muted-foreground">Please wait while your materials are being imported...</p>
              </div>
            )}

            {importStep === "results" && importResults && (
              <div className="space-y-4">
                <div className="bg-muted p-6 rounded-md text-center">
                  <div className="flex justify-center gap-8 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">{importResults.success}</div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-1">{importResults.failed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>

                  {importResults.success > 0 && importResults.failed === 0 ? (
                    <div className="flex items-center justify-center text-green-600 gap-2">
                      <Check className="h-5 w-5" />
                      <span>All materials were imported successfully!</span>
                    </div>
                  ) : importResults.failed > 0 ? (
                    <div className="flex items-center justify-center text-amber-600 gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>Some materials could not be imported.</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-red-600 gap-2">
                      <X className="h-5 w-5" />
                      <span>No materials were imported.</span>
                    </div>
                  )}
                </div>

                {importResults.errors.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Error Details</h3>
                    <div className="max-h-[200px] overflow-y-auto bg-muted p-2 rounded-md">
                      {importResults.errors.map((error: string, i: number) => (
                        <div key={i} className="text-sm text-red-600 py-1 border-b last:border-0">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end items-center pt-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetImport}>
                      Import More
                    </Button>
                    <Button
                      onClick={() => {
                        closeDialog()
                        // Refresh the page to show new materials
                        window.location.reload()
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search materials by name, type, or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
              <div className="min-w-[180px]">
                <Select value={selectedMaterialType} onValueChange={setSelectedMaterialType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Material Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Material Types</SelectItem>
                    {materialTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[180px]">
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[180px]">
                <Select value={selectedEmissionSource} onValueChange={setSelectedEmissionSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Emission Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {emissionSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                Active filters:
              </div>
              {searchTerm && <Badge variant="secondary">Search: "{searchTerm}"</Badge>}
              {selectedMaterialType !== "all" && <Badge variant="secondary">Type: {selectedMaterialType}</Badge>}
              {selectedSupplier !== "all" && <Badge variant="secondary">Supplier: {selectedSupplier}</Badge>}
              {selectedEmissionSource !== "all" && <Badge variant="secondary">Source: {selectedEmissionSource}</Badge>}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList className="bg-pathway-green/10 border-pathway-gold/30">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-pathway-gold data-[state=active]:text-pathway-green"
          >
            All Materials ({filteredMaterials.length})
          </TabsTrigger>
          <TabsTrigger
            value="recent"
            className="data-[state=active]:bg-pathway-gold data-[state=active]:text-pathway-green"
          >
            Recently Added ({recentMaterials.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredMaterials.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="h-10">
                      <TableHead className="font-semibold">Material Name</TableHead>
                      <TableHead className="font-semibold">Supplier</TableHead>
                      <TableHead className="font-semibold">Material Type</TableHead>
                      <TableHead className="font-semibold">Material Subtype</TableHead>
                      <TableHead className="font-semibold">Unit</TableHead>
                      <TableHead className="font-semibold">Emission Factor</TableHead>
                      <TableHead className="font-semibold">Emission Source</TableHead>
                      <TableHead className="font-semibold">Evidence</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.map((material, index) => (
                      <TableRow key={material.material_id || index} className="h-12">
                        <TableCell className="font-medium py-2">{material.material_name}</TableCell>
                        <TableCell className="py-2">{material.supplier || "N/A"}</TableCell>
                        <TableCell className="py-2">
                          {material.material_type ? <Badge variant="outline">{material.material_type}</Badge> : "N/A"}
                        </TableCell>
                        <TableCell className="py-2">{material.material_subtype || "N/A"}</TableCell>
                        <TableCell className="py-2 font-mono text-sm">{material.unit || "N/A"}</TableCell>
                        <TableCell className="py-2 font-mono text-sm">
                          {material.embodied_co2_t_per_unit
                            ? `${Number(material.embodied_co2_t_per_unit).toFixed(3)} t CO₂`
                            : "N/A"}
                        </TableCell>
                        <TableCell className="py-2">
                          {material.emission_source ? (
                            <Badge variant="secondary" className="text-xs">
                              {material.emission_source}
                            </Badge>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell className="py-2">
                          {material.evidence_url ? (
                            <a
                              href={material.evidence_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell className="text-right py-2">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Settings className="h-4 w-4 mr-1" />
                            Attributes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {hasActiveFilters ? "No Materials Match Your Filters" : "No Materials Found"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {hasActiveFilters
                      ? "Try adjusting your search criteria or clearing the filters."
                      : "Your material library is empty. Import materials to get started."}
                  </p>
                  {hasActiveFilters ? (
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  ) : (
                    <Button onClick={() => setIsImportDialogOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Materials
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          {recentMaterials.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="h-10">
                      <TableHead className="font-semibold">Material Name</TableHead>
                      <TableHead className="font-semibold">Supplier</TableHead>
                      <TableHead className="font-semibold">Material Type</TableHead>
                      <TableHead className="font-semibold">Unit</TableHead>
                      <TableHead className="font-semibold">Emission Factor</TableHead>
                      <TableHead className="font-semibold">Date Added</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMaterials.map((material, index) => (
                      <TableRow key={material.material_id || index} className="h-12">
                        <TableCell className="font-medium py-2">{material.material_name}</TableCell>
                        <TableCell className="py-2">{material.supplier || "N/A"}</TableCell>
                        <TableCell className="py-2">
                          {material.material_type ? <Badge variant="outline">{material.material_type}</Badge> : "N/A"}
                        </TableCell>
                        <TableCell className="py-2 font-mono text-sm">{material.unit || "N/A"}</TableCell>
                        <TableCell className="py-2 font-mono text-sm">
                          {material.embodied_co2_t_per_unit
                            ? `${Number(material.embodied_co2_t_per_unit).toFixed(3)} t CO₂`
                            : "N/A"}
                        </TableCell>
                        <TableCell className="py-2 text-sm">
                          {material.date_added ? new Date(material.date_added).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-right py-2">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Settings className="h-4 w-4 mr-1" />
                            Attributes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recent Materials</h3>
                  <p className="text-muted-foreground mb-4">No materials have been added recently.</p>
                  <Button onClick={() => setIsImportDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Materials
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
