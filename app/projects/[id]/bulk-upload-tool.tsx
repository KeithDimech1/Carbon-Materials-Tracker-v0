"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from "lucide-react"
import { bulkUploadDeliveries, generateDeliveryTemplate } from "@/app/actions/bulk-deliveries"

interface BulkUploadToolProps {
  projectId: string
  onClose: () => void
}

export function BulkUploadTool({ projectId, onClose }: BulkUploadToolProps) {
  const [uploadStep, setUploadStep] = useState<"upload" | "mapping" | "validation" | "complete">("upload")
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validationResults, setValidationResults] = useState<any[]>([])
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Platform field definitions
  const platformFields = [
    { key: "contractor", label: "Contractor", required: true },
    { key: "delivery_date", label: "Delivery Date", required: true },
    { key: "site", label: "Site", required: true },
    { key: "cost_code", label: "Cost Code", required: true },
    { key: "docket_number", label: "Docket Number", required: false },
    { key: "material_type", label: "Material Type", required: true },
    { key: "supplier", label: "Supplier", required: true },
    { key: "material", label: "Material", required: true },
    { key: "unit", label: "Unit", required: true },
    { key: "quantity", label: "Quantity", required: true },
    { key: "total_cost", label: "Total Cost", required: false },
    { key: "material_description", label: "Material Description", required: false },
    { key: "origin", label: "Origin", required: false },
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter((line) => !line.startsWith("#")) // Filter out comment lines
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
      const data = lines
        .slice(1)
        .map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
          const row: Record<string, string> = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ""
          })
          return row
        })
        .filter((row) => Object.values(row).some((v) => v)) // Remove empty rows

      setCsvHeaders(headers)
      setCsvData(data)
      setUploadStep("mapping")
    }
    reader.readAsText(file)
  }

  const handleMapping = () => {
    // Validate mapping
    const requiredFields = platformFields.filter((f) => f.required)
    const missingFields = requiredFields.filter((f) => !columnMapping[f.key])

    if (missingFields.length > 0) {
      alert(`Please map the following required fields: ${missingFields.map((f) => f.label).join(", ")}`)
      return
    }

    // Process data with mapping
    const mappedData = csvData.map((row, index) => {
      const mappedRow: any = { originalIndex: index }

      platformFields.forEach((field) => {
        const csvColumn = columnMapping[field.key]
        if (csvColumn) {
          mappedRow[field.key] = row[csvColumn]
        }
      })

      return mappedRow
    })

    setValidationResults(mappedData)
    setUploadStep("validation")
  }

  const handleImport = async () => {
    setIsUploading(true)
    try {
      const result = await bulkUploadDeliveries(projectId, validationResults)
      setUploadResult(result)
      setUploadStep("complete")
    } catch (error) {
      console.error("Upload error:", error)
      setUploadResult({
        success: false,
        validDeliveries: 0,
        invalidDeliveries: 0,
        errors: ["Upload failed. Please try again."],
      })
      setUploadStep("complete")
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = async () => {
    try {
      const csvContent = await generateDeliveryTemplate(projectId)
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `delivery_template_project_${projectId}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating template:", error)
      alert("Failed to generate template. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      {uploadStep === "upload" && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
              <p className="text-muted-foreground mb-4">Select a CSV file containing delivery records</p>
              <Input type="file" accept=".csv" onChange={handleFileUpload} className="max-w-xs mx-auto" />
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template with Lookup Data
            </Button>
          </div>
        </div>
      )}

      {uploadStep === "mapping" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Map CSV Columns</h3>
            <p className="text-muted-foreground mb-4">
              Map your CSV columns to platform fields. Required fields are marked with *
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {platformFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                <Select
                  value={columnMapping[field.key] || "-- Not mapped --"}
                  onValueChange={(value) => setColumnMapping((prev) => ({ ...prev, [field.key]: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select CSV column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-- Not mapped --">-- Not mapped --</SelectItem>
                    {csvHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUploadStep("upload")}>
              Back
            </Button>
            <Button onClick={handleMapping}>Preview Data</Button>
          </div>
        </div>
      )}

      {uploadStep === "validation" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Preview Upload Data</h3>
            <p className="text-muted-foreground mb-4">
              Review the data before uploading. Invalid entries will be saved to the delivery errors section for manual
              review.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-semibold">{validationResults.length}</p>
                    <p className="text-sm text-muted-foreground">Total Records</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-semibold">Auto-Validation</p>
                    <p className="text-sm text-muted-foreground">Will check against database</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validationResults.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.originalIndex + 1}</TableCell>
                    <TableCell>{row.contractor || "N/A"}</TableCell>
                    <TableCell>{row.material || "N/A"}</TableCell>
                    <TableCell>{row.supplier || "N/A"}</TableCell>
                    <TableCell>{row.quantity || "N/A"}</TableCell>
                    <TableCell>{row.delivery_date || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUploadStep("mapping")}>
              Back
            </Button>
            <Button onClick={handleImport} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Deliveries"}
            </Button>
          </div>
        </div>
      )}

      {uploadStep === "complete" && (
        <div className="text-center space-y-4">
          {uploadResult?.success ? (
            <>
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <h3 className="text-lg font-semibold">Upload Complete</h3>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Successfully processed {uploadResult.validDeliveries + uploadResult.invalidDeliveries} records
                </p>
                {uploadResult.validDeliveries > 0 && (
                  <p className="text-green-600">✓ {uploadResult.validDeliveries} deliveries added to project</p>
                )}
                {uploadResult.invalidDeliveries > 0 && (
                  <p className="text-amber-600">
                    ⚠ {uploadResult.invalidDeliveries} entries saved to delivery errors for manual review
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-16 w-16 mx-auto text-red-500" />
              <h3 className="text-lg font-semibold">Upload Failed</h3>
              <p className="text-muted-foreground">{uploadResult?.errors?.[0] || "An error occurred during upload"}</p>
            </>
          )}
          <Button onClick={onClose}>Close</Button>
        </div>
      )}
    </div>
  )
}
