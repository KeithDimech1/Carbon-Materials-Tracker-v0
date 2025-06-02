"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from "lucide-react"

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

  // Platform field definitions
  const platformFields = [
    { key: "contractor", label: "Contractor", required: true },
    { key: "delivery_date", label: "Delivery Date", required: true },
    { key: "site", label: "Site", required: true },
    { key: "package", label: "Package", required: false },
    { key: "cost_code", label: "Cost Code", required: true },
    { key: "docket_number", label: "Docket Number", required: false },
    { key: "material_type", label: "Material Type", required: true },
    { key: "supplier", label: "Supplied By", required: true },
    { key: "material", label: "Material", required: true },
    { key: "unit", label: "Specific Unit", required: true },
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
      const lines = text.split("\n")
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
      const mappedRow: any = { originalIndex: index, errors: [], warnings: [] }

      platformFields.forEach((field) => {
        const csvColumn = columnMapping[field.key]
        if (csvColumn) {
          mappedRow[field.key] = row[csvColumn]

          // Basic validation
          if (field.required && !mappedRow[field.key]) {
            mappedRow.errors.push(`${field.label} is required`)
          }

          // Date validation
          if (field.key === "delivery_date" && mappedRow[field.key]) {
            const date = new Date(mappedRow[field.key])
            if (isNaN(date.getTime())) {
              mappedRow.errors.push(`Invalid date format for ${field.label}`)
            }
          }

          // Quantity validation
          if (field.key === "quantity" && mappedRow[field.key]) {
            const quantity = Number.parseFloat(mappedRow[field.key])
            if (isNaN(quantity) || quantity <= 0) {
              mappedRow.errors.push(`Invalid quantity: must be a positive number`)
            }
          }
        }
      })

      return mappedRow
    })

    setValidationResults(mappedData)
    setUploadStep("validation")
  }

  const handleImport = () => {
    // Filter out rows with errors
    const validRows = validationResults.filter((row) => row.errors.length === 0)

    // Here you would make API calls to import the data
    console.log("Importing rows:", validRows)

    setUploadStep("complete")
  }

  const downloadTemplate = () => {
    const headers = platformFields.map((f) => f.label).join(",")
    const sampleRow = [
      "BuildCorp Ltd.",
      "2024-01-15",
      "Foundation Block A",
      "Package 1",
      "CC-001-STR",
      "DOC-12345",
      "Concrete",
      "ABC Concrete Co.",
      "40 MPa Concrete",
      "m³",
      "125.5",
      "15000",
      "High strength concrete for foundations",
      "2000",
    ].join(",")

    const csvContent = `${headers}\n${sampleRow}`
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "delivery_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
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
              Download Template
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
            <Button onClick={handleMapping}>Validate Data</Button>
          </div>
        </div>
      )}

      {uploadStep === "validation" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Validation Results</h3>
            <p className="text-muted-foreground mb-4">Review the validation results before importing</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold">{validationResults.filter((r) => r.errors.length === 0).length}</p>
                    <p className="text-sm text-muted-foreground">Valid Records</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-semibold">{validationResults.filter((r) => r.errors.length > 0).length}</p>
                    <p className="text-sm text-muted-foreground">Invalid Records</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
          </div>

          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validationResults.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.originalIndex + 1}</TableCell>
                    <TableCell>
                      {row.errors.length === 0 ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Valid
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Invalid</Badge>
                      )}
                    </TableCell>
                    <TableCell>{row.material || "N/A"}</TableCell>
                    <TableCell>{row.quantity || "N/A"}</TableCell>
                    <TableCell>{row.delivery_date || "N/A"}</TableCell>
                    <TableCell>
                      {row.errors.length > 0 && <div className="text-sm text-red-600">{row.errors.join(", ")}</div>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUploadStep("mapping")}>
              Back
            </Button>
            <Button
              onClick={handleImport}
              disabled={validationResults.filter((r) => r.errors.length === 0).length === 0}
            >
              Import Valid Records
            </Button>
          </div>
        </div>
      )}

      {uploadStep === "complete" && (
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
          <h3 className="text-lg font-semibold">Import Complete</h3>
          <p className="text-muted-foreground">
            Successfully imported {validationResults.filter((r) => r.errors.length === 0).length} delivery records
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      )}
    </div>
  )
}
