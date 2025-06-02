"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Type definitions for material import
type MaterialImportField = {
  csvHeader: string
  dbField: string
  required: boolean
  type: "core" | "attribute"
  options?: string[]
}

type MaterialImportMapping = {
  [key: string]: {
    fieldType: "core" | "attribute" | "ignore"
    targetField?: string
    unitId?: string
  }
}

type MaterialImportRow = {
  [key: string]: string | number | null
}

export async function validateMaterialCSV(csvData: string) {
  try {
    // Parse CSV data
    const lines = csvData.trim().split("\n")
    const headers = parseCSVLine(lines[0])

    // Get reference data for validation
    const supabase = createServerClient()

    // Fetch all the reference data needed for validation
    const [
      { data: materialTypes, error: materialTypesError },
      { data: materialSubtypes, error: materialSubtypesError },
      { data: suppliers, error: suppliersError },
      { data: units, error: unitsError },
      { data: genericMaterials, error: genericMaterialsError },
      { data: transportModes, error: transportModesError },
      { data: emissionSources, error: emissionSourcesError },
    ] = await Promise.all([
      supabase.from("material_types").select("material_type_id, material_type_name as name"),
      supabase.from("material_subtypes").select("material_subtype_id, material_subtype_name as name"),
      supabase.from("suppliers").select("supplier_id, supplier_name as name"),
      supabase.from("units").select("unit_id, unit_name as name, symbol"),
      supabase.from("generic_materials").select("generic_material_id, display_name as name"),
      supabase.from("transport_modes").select("transport_mode_id, name"),
      supabase.from("emission_source").select("source_id, emission_source_name as name"),
    ])

    // Log any errors but continue with available data
    if (materialTypesError) console.log("Material types error:", materialTypesError)
    if (materialSubtypesError) console.log("Material subtypes error:", materialSubtypesError)
    if (suppliersError) console.log("Suppliers error:", suppliersError)
    if (unitsError) console.log("Units error:", unitsError)
    if (genericMaterialsError) console.log("Generic materials error:", genericMaterialsError)
    if (transportModesError) console.log("Transport modes error:", transportModesError)
    if (emissionSourcesError) console.log("Emission sources error:", emissionSourcesError)

    // Define core fields based on actual schema
    const coreFields: MaterialImportField[] = [
      { csvHeader: "Material Name", dbField: "material_name", required: true, type: "core" },
      { csvHeader: "Embodied CO2", dbField: "embodied_co2_t_per_unit", required: false, type: "core" },
      { csvHeader: "Evidence URL", dbField: "material_evidence_url", required: false, type: "core" },
      {
        csvHeader: "Material Type",
        dbField: "material_type_id",
        required: false,
        type: "core",
        options: materialTypes?.map((t) => t.name) || [],
      },
      {
        csvHeader: "Material Subtype",
        dbField: "material_subtype_id",
        required: false,
        type: "core",
        options: materialSubtypes?.map((t) => t.name) || [],
      },
      {
        csvHeader: "Supplier",
        dbField: "supplier_id",
        required: false,
        type: "core",
        options: suppliers?.map((s) => s.name) || [],
      },
      {
        csvHeader: "Unit",
        dbField: "unit_id",
        required: false,
        type: "core",
        options: units?.map((u) => u.name) || [],
      },
      {
        csvHeader: "Generic Material",
        dbField: "generic_material_id",
        required: false,
        type: "core",
        options: genericMaterials?.map((g) => g.name) || [],
      },
      {
        csvHeader: "Transport Mode",
        dbField: "transport_mode_id",
        required: false,
        type: "core",
        options: transportModes?.map((t) => t.name) || [],
      },
      {
        csvHeader: "Emission Source",
        dbField: "emission_source_id",
        required: false,
        type: "core",
        options: emissionSources?.map((e) => e.name) || [],
      },
    ]

    // Create initial field mapping suggestion
    const suggestedMapping: MaterialImportMapping = {}

    headers.forEach((header) => {
      // Check if it's a core field
      const coreField = coreFields.find(
        (f) => f.csvHeader.toLowerCase() === header.toLowerCase() || f.dbField.toLowerCase() === header.toLowerCase(),
      )

      if (coreField) {
        suggestedMapping[header] = {
          fieldType: "core",
          targetField: coreField.dbField,
        }
      } else {
        // Otherwise ignore it for now
        suggestedMapping[header] = {
          fieldType: "ignore",
        }
      }
    })

    // Parse a sample of rows for preview
    const sampleRows: MaterialImportRow[] = []
    const maxSampleRows = Math.min(5, lines.length - 1)

    for (let i = 1; i <= maxSampleRows; i++) {
      if (lines[i]) {
        const values = parseCSVLine(lines[i])
        const row: MaterialImportRow = {}

        headers.forEach((header, index) => {
          row[header] = values[index] || null
        })

        sampleRows.push(row)
      }
    }

    return {
      success: true,
      headers,
      suggestedMapping,
      sampleRows,
      referenceData: {
        materialTypes: materialTypes || [],
        materialSubtypes: materialSubtypes || [],
        suppliers: suppliers || [],
        units: units || [],
        genericMaterials: genericMaterials || [],
        transportModes: transportModes || [],
        emissionSources: emissionSources || [],
      },
      totalRows: lines.length - 1,
    }
  } catch (error) {
    console.error("CSV validation error:", error)
    return {
      success: false,
      error: "Failed to validate CSV data: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

export async function importMaterials(csvData: string, fieldMapping: MaterialImportMapping) {
  try {
    const supabase = createServerClient()
    const lines = csvData.trim().split("\n")
    const headers = parseCSVLine(lines[0])

    // Get reference data for lookups
    const [
      { data: materialTypes },
      { data: materialSubtypes },
      { data: suppliers },
      { data: units },
      { data: genericMaterials },
      { data: transportModes },
      { data: emissionSources },
    ] = await Promise.all([
      supabase.from("material_types").select("material_type_id, material_type_name as name"),
      supabase.from("material_subtypes").select("material_subtype_id, material_subtype_name as name"),
      supabase.from("suppliers").select("supplier_id, supplier_name as name"),
      supabase.from("units").select("unit_id, unit_name as name, symbol"),
      supabase.from("generic_materials").select("generic_material_id, display_name as name"),
      supabase.from("transport_modes").select("transport_mode_id, name"),
      supabase.from("emission_source").select("source_id, emission_source_name as name"),
    ])

    // Create lookup maps for reference data
    const lookupMaps = {
      material_type_id: new Map((materialTypes || []).map((t) => [t.name.toLowerCase(), t.material_type_id])),
      material_subtype_id: new Map((materialSubtypes || []).map((t) => [t.name.toLowerCase(), t.material_subtype_id])),
      supplier_id: new Map((suppliers || []).map((s) => [s.name.toLowerCase(), s.supplier_id])),
      unit_id: new Map((units || []).map((u) => [u.name.toLowerCase(), u.unit_id])),
      generic_material_id: new Map((genericMaterials || []).map((g) => [g.name.toLowerCase(), g.generic_material_id])),
      transport_mode_id: new Map((transportModes || []).map((t) => [t.name.toLowerCase(), t.transport_mode_id])),
      emission_source_id: new Map((emissionSources || []).map((e) => [e.name.toLowerCase(), e.source_id])),
    }

    // Process each row
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Group field mappings
    const coreFields = new Map<string, string>()

    // Organize mappings
    for (const [csvHeader, mapping] of Object.entries(fieldMapping)) {
      if (mapping.fieldType === "core") {
        coreFields.set(csvHeader, mapping.targetField || "")
      }
    }

    // Process each row (skip header)
    for (let i = 1; i < lines.length; i++) {
      try {
        if (!lines[i].trim()) continue

        const values = parseCSVLine(lines[i])
        const rowData: Record<string, any> = {}

        // Process core fields
        coreFields.forEach((dbField, csvHeader) => {
          const headerIndex = headers.indexOf(csvHeader)
          if (headerIndex !== -1) {
            const value = values[headerIndex]

            // Handle reference lookups
            if (dbField in lookupMaps && value) {
              const lookupMap = lookupMaps[dbField as keyof typeof lookupMaps]
              const lookupId = lookupMap.get(value.toLowerCase())

              if (lookupId) {
                rowData[dbField] = lookupId
              } else {
                console.warn(`Reference value not found: ${value} for field ${dbField}`)
                // Don't fail the import, just skip this reference
              }
            } else {
              // Handle numeric fields
              if (dbField === "embodied_co2_t_per_unit" && value) {
                const numValue = Number.parseFloat(value)
                if (!isNaN(numValue)) {
                  rowData[dbField] = numValue
                }
              } else {
                rowData[dbField] = value || null
              }
            }
          }
        })

        // Ensure we have at least a material name
        if (!rowData.material_name) {
          throw new Error("Material name is required")
        }

        // Add metadata
        rowData.created_at = new Date().toISOString()

        // Insert the material
        const { data: material, error: materialError } = await supabase
          .from("materials")
          .insert(rowData)
          .select("material_id")
          .single()

        if (materialError) {
          throw new Error(`Failed to insert material: ${materialError.message}`)
        }

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`Row ${i}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    revalidatePath("/material-library")
    return {
      success: true,
      results,
    }
  } catch (error) {
    console.error("Material import error:", error)
    return {
      success: false,
      error: "Failed to import materials: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

// Helper function to parse CSV lines properly handling quoted fields
function parseCSVLine(line: string): string[] {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.replace(/^"|"$/g, ""))
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.replace(/^"|"$/g, ""))
  return result
}
