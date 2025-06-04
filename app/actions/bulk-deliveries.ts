"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/database.types"

type RawDeliveryInsert = Database["public"]["Tables"]["raw_deliveries"]["Insert"]
type DeliveryInsert = Database["public"]["Tables"]["deliveries"]["Insert"]

interface BulkUploadResult {
  success: boolean
  validDeliveries: number
  invalidDeliveries: number
  errors?: string[]
}

interface LookupData {
  contractors: Array<{ id: string; name: string }>
  designPackages: Array<{ id: string; name: string; project_id: string }>
  costCodes: Array<{ id: string; name: string; project_id: string }>
  materialTypes: Array<{ id: string; name: string }>
  suppliers: Array<{ id: string; name: string }>
  materials: Array<{ id: string; name: string; supplier_id: string; material_type_id: string }>
  units: Array<{ id: string; name: string; symbol: string }>
  project?: { id: string; name: string }
}

export async function getLookupData(projectId: string): Promise<LookupData> {
  const supabase = createServerClient()

  // Get project details first
  const { data: project } = await supabase
    .from("projects")
    .select("project_id as id, project_name as name")
    .eq("project_id", projectId)
    .single()

  const [contractors, designPackages, costCodes, materialTypes, suppliers, materials, units] = await Promise.allSettled(
    [
      supabase.from("contractors").select("contractor_id as id, contractor_name as name").order("contractor_name"),
      // Get locations but filter by type = 'design package' or similar
      supabase
        .from("locations")
        .select("location_id as id, location_name as name, project_id, location_type")
        .eq("project_id", projectId)
        .order("location_name"),
      supabase
        .from("project_cost_codes")
        .select("cost_code_id as id, cost_code_name as name, project_id")
        .eq("project_id", projectId)
        .order("cost_code_name"),
      supabase
        .from("material_types")
        .select("material_type_id as id, material_type_name as name")
        .order("material_type_name"),
      supabase.from("suppliers").select("supplier_id as id, supplier_name as name").order("supplier_name"),
      supabase
        .from("materials")
        .select("material_id as id, material_name as name, supplier_id, material_type_id")
        .order("material_name"),
      supabase.from("units").select("unit_id as id, unit_name as name, unit_symbol as symbol").order("unit_name"),
    ],
  )

  return {
    project,
    contractors: contractors.status === "fulfilled" ? contractors.value.data || [] : [],
    designPackages: designPackages.status === "fulfilled" ? designPackages.value.data || [] : [],
    costCodes: costCodes.status === "fulfilled" ? costCodes.value.data || [] : [],
    materialTypes: materialTypes.status === "fulfilled" ? materialTypes.value.data || [] : [],
    suppliers: suppliers.status === "fulfilled" ? suppliers.value.data || [] : [],
    materials: materials.status === "fulfilled" ? materials.value.data || [] : [],
    units: units.status === "fulfilled" ? units.value.data || [] : [],
  }
}

export async function generateDeliveryTemplate(projectId: string) {
  const lookupData = await getLookupData(projectId)
  const projectName = lookupData.project?.name || "Project"

  // Create the CSV content as a 2D array for better control
  const csvData: string[][] = []

  // Row 1: Project name (A1-B1)
  csvData.push(["Project:", projectName])

  // Row 2: Empty
  csvData.push([])

  // Row 3: Available Contractors (A3 and to the right)
  const contractorRow = ["# Available Contractors:"]
  lookupData.contractors.forEach((c) => contractorRow.push(c.name))
  csvData.push(contractorRow)

  // Row 4: Available Design Packages (A4 and to the right)
  const designPackageRow = ["# Available Design Packages:"]
  lookupData.designPackages.forEach((dp) => designPackageRow.push(dp.name))
  csvData.push(designPackageRow)

  // Row 5: Available Cost Codes (A5 and to the right)
  const costCodeRow = ["# Available Cost Codes:"]
  lookupData.costCodes.forEach((c) => costCodeRow.push(c.name))
  csvData.push(costCodeRow)

  // Row 6: Available Material Types (A6 and to the right)
  const materialTypeRow = ["# Available Material Types:"]
  lookupData.materialTypes.forEach((m) => materialTypeRow.push(m.name))
  csvData.push(materialTypeRow)

  // Row 7: Available Suppliers (A7 and to the right)
  const supplierRow = ["# Available Suppliers:"]
  lookupData.suppliers.forEach((s) => supplierRow.push(s.name))
  csvData.push(supplierRow)

  // Row 8: Available Units (A8 and to the right)
  const unitRow = ["# Available Units:"]
  lookupData.units.forEach((u) => unitRow.push(`${u.name} (${u.symbol})`))
  csvData.push(unitRow)

  // Row 9: Empty
  csvData.push([])

  // Row 10: Headers
  const headers = [
    "Contractor",
    "Delivery Date",
    "Design Package",
    "Cost Code",
    "Docket Number",
    "Material Type",
    "Supplier",
    "Material",
    "Unit",
    "Quantity",
    "Total Cost",
    "Material Description",
    "Origin",
  ]
  csvData.push(headers)

  // Row 11: Sample data
  if (
    lookupData.contractors.length > 0 &&
    lookupData.designPackages.length > 0 &&
    lookupData.costCodes.length > 0 &&
    lookupData.materialTypes.length > 0 &&
    lookupData.suppliers.length > 0 &&
    lookupData.materials.length > 0 &&
    lookupData.units.length > 0
  ) {
    const sampleRow = [
      lookupData.contractors[0]?.name || "",
      "2024-01-15",
      lookupData.designPackages[0]?.name || "",
      lookupData.costCodes[0]?.name || "",
      "DOC-12345",
      lookupData.materialTypes[0]?.name || "",
      lookupData.suppliers[0]?.name || "",
      lookupData.materials[0]?.name || "",
      lookupData.units[0]?.symbol || "",
      "125.5",
      "15000",
      "High strength concrete for foundations",
      "2000",
    ]
    csvData.push(sampleRow)
  }

  // Convert to CSV string
  const csvContent = csvData.map((row) => row.join(",")).join("\n")

  return csvContent
}

function validateDeliveryRow(row: any, lookupData: LookupData, projectId: string) {
  const errors: string[] = []
  const validatedRow: any = { ...row }

  // Validate contractor
  const contractor = lookupData.contractors.find((c) => c.name.toLowerCase() === row.contractor?.toLowerCase())
  if (row.contractor && !contractor) {
    errors.push(`Contractor "${row.contractor}" not found`)
  } else if (contractor) {
    validatedRow.contractor_id = contractor.id
  }

  // Validate design package (project-specific)
  const designPackage = lookupData.designPackages.find(
    (dp) => dp.name.toLowerCase() === row.design_package?.toLowerCase() && dp.project_id === projectId,
  )
  if (row.design_package && !designPackage) {
    errors.push(`Design Package "${row.design_package}" not found for this project`)
  } else if (designPackage) {
    validatedRow.location_id = designPackage.id
  }

  // Validate cost code (project-specific)
  const costCode = lookupData.costCodes.find(
    (c) => c.name.toLowerCase() === row.cost_code?.toLowerCase() && c.project_id === projectId,
  )
  if (row.cost_code && !costCode) {
    errors.push(`Cost code "${row.cost_code}" not found for this project`)
  } else if (costCode) {
    validatedRow.cost_code_id = costCode.id
  }

  // Validate material type
  const materialType = lookupData.materialTypes.find((m) => m.name.toLowerCase() === row.material_type?.toLowerCase())
  if (row.material_type && !materialType) {
    errors.push(`Material type "${row.material_type}" not found`)
  } else if (materialType) {
    validatedRow.material_type_id = materialType.id
  }

  // Validate supplier
  const supplier = lookupData.suppliers.find((s) => s.name.toLowerCase() === row.supplier?.toLowerCase())
  if (row.supplier && !supplier) {
    errors.push(`Supplier "${row.supplier}" not found`)
  } else if (supplier) {
    validatedRow.supplier_id = supplier.id
  }

  // Validate material (must match supplier and material type)
  const material = lookupData.materials.find(
    (m) =>
      m.name.toLowerCase() === row.material?.toLowerCase() &&
      (!supplier || m.supplier_id === supplier.id) &&
      (!materialType || m.material_type_id === materialType.id),
  )
  if (row.material && !material) {
    errors.push(`Material "${row.material}" not found or doesn't match supplier/type`)
  } else if (material) {
    validatedRow.material_id = material.id
  }

  // Validate unit
  const unit = lookupData.units.find(
    (u) => u.name.toLowerCase() === row.unit?.toLowerCase() || u.symbol.toLowerCase() === row.unit?.toLowerCase(),
  )
  if (row.unit && !unit) {
    errors.push(`Unit "${row.unit}" not found`)
  } else if (unit) {
    validatedRow.unit_id = unit.id
  }

  // Validate required fields
  if (!row.contractor) errors.push("Contractor is required")
  if (!row.delivery_date) errors.push("Delivery date is required")
  if (!row.design_package) errors.push("Design Package is required")
  if (!row.material_type) errors.push("Material type is required")
  if (!row.supplier) errors.push("Supplier is required")
  if (!row.material) errors.push("Material is required")
  if (!row.unit) errors.push("Unit is required")
  if (!row.quantity || isNaN(Number(row.quantity))) errors.push("Valid quantity is required")

  return { errors, validatedRow }
}

export async function bulkUploadDeliveries(projectId: string, deliveries: any[]): Promise<BulkUploadResult> {
  const supabase = createServerClient()

  try {
    // Get lookup data for validation
    const lookupData = await getLookupData(projectId)

    const validDeliveries: DeliveryInsert[] = []
    const invalidDeliveries: RawDeliveryInsert[] = []

    // Process each delivery row
    for (const row of deliveries) {
      const { errors, validatedRow } = validateDeliveryRow(row, lookupData, projectId)

      if (errors.length === 0) {
        // Valid delivery - prepare for deliveries table
        const delivery: DeliveryInsert = {
          project_id: projectId,
          contractor_id: validatedRow.contractor_id,
          delivery_date: validatedRow.delivery_date,
          location_id: validatedRow.location_id,
          cost_code_id: validatedRow.cost_code_id,
          docket_number: validatedRow.docket_number || null,
          material_id: validatedRow.material_id,
          supplier_id: validatedRow.supplier_id,
          quantity: Number(validatedRow.quantity),
          total_cost: validatedRow.total_cost ? Number(validatedRow.total_cost) : null,
          embodied_co2: 0, // Will be calculated based on material emission factor
        }

        // Calculate embodied CO2
        const { data: material } = await supabase
          .from("materials")
          .select("embodied_co2_t_per_unit")
          .eq("material_id", delivery.material_id)
          .single()

        if (material) {
          delivery.embodied_co2 = delivery.quantity * material.embodied_co2_t_per_unit
        }

        validDeliveries.push(delivery)
      } else {
        // Invalid delivery - prepare for raw_deliveries table
        const rawDelivery: RawDeliveryInsert = {
          project_id: projectId,
          contractor_name: row.contractor,
          contractor_id: validatedRow.contractor_id || null,
          delivery_date: row.delivery_date,
          location_name: row.design_package,
          location_id: validatedRow.location_id || null,
          cost_code_name: row.cost_code,
          cost_code_id: validatedRow.cost_code_id || null,
          docket_number: row.docket_number,
          material_type_name: row.material_type,
          material_type_id: validatedRow.material_type_id || null,
          supplier_name: row.supplier,
          supplier_id: validatedRow.supplier_id || null,
          material_name: row.material,
          material_id: validatedRow.material_id || null,
          unit_name: row.unit,
          unit_id: validatedRow.unit_id || null,
          quantity: row.quantity ? Number(row.quantity) : null,
          total_cost: row.total_cost ? Number(row.total_cost) : null,
          material_description: row.material_description,
          origin_postcode: row.origin,
          validation_errors: errors,
        }

        invalidDeliveries.push(rawDelivery)
      }
    }

    // Insert valid deliveries
    if (validDeliveries.length > 0) {
      const { error: deliveriesError } = await supabase.from("deliveries").insert(validDeliveries)

      if (deliveriesError) {
        throw new Error(`Failed to insert valid deliveries: ${deliveriesError.message}`)
      }
    }

    // Insert invalid deliveries to raw_deliveries
    if (invalidDeliveries.length > 0) {
      const { error: rawError } = await supabase.from("raw_deliveries").insert(invalidDeliveries)

      if (rawError) {
        throw new Error(`Failed to insert invalid deliveries: ${rawError.message}`)
      }
    }

    revalidatePath(`/projects/${projectId}`)
    revalidatePath("/deliveries")

    return {
      success: true,
      validDeliveries: validDeliveries.length,
      invalidDeliveries: invalidDeliveries.length,
    }
  } catch (error) {
    console.error("Bulk upload error:", error)
    return {
      success: false,
      validDeliveries: 0,
      invalidDeliveries: 0,
      errors: [error instanceof Error ? error.message : "Unknown error occurred"],
    }
  }
}

export async function getRawDeliveries(projectId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("raw_deliveries")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching raw deliveries:", error)
    throw new Error(`Failed to fetch raw deliveries: ${error.message}`)
  }

  return data || []
}

export async function resolveRawDelivery(rawDeliveryId: string, resolvedData: any) {
  const supabase = createServerClient()

  try {
    // Get the raw delivery
    const { data: rawDelivery, error: fetchError } = await supabase
      .from("raw_deliveries")
      .select("*")
      .eq("id", rawDeliveryId)
      .single()

    if (fetchError || !rawDelivery) {
      throw new Error("Raw delivery not found")
    }

    // Create the resolved delivery
    const delivery: DeliveryInsert = {
      project_id: rawDelivery.project_id,
      contractor_id: resolvedData.contractor_id,
      delivery_date: rawDelivery.delivery_date || resolvedData.delivery_date,
      location_id: resolvedData.location_id,
      cost_code_id: resolvedData.cost_code_id,
      docket_number: rawDelivery.docket_number,
      material_id: resolvedData.material_id,
      supplier_id: resolvedData.supplier_id,
      quantity: rawDelivery.quantity || 0,
      total_cost: rawDelivery.total_cost,
      embodied_co2: 0,
    }

    // Calculate embodied CO2
    const { data: material } = await supabase
      .from("materials")
      .select("embodied_co2_t_per_unit")
      .eq("material_id", delivery.material_id)
      .single()

    if (material) {
      delivery.embodied_co2 = delivery.quantity * material.embodied_co2_t_per_unit
    }

    // Insert the resolved delivery
    const { error: insertError } = await supabase.from("deliveries").insert(delivery)

    if (insertError) {
      throw new Error(`Failed to create delivery: ${insertError.message}`)
    }

    // Delete the raw delivery
    const { error: deleteError } = await supabase.from("raw_deliveries").delete().eq("id", rawDeliveryId)

    if (deleteError) {
      throw new Error(`Failed to delete raw delivery: ${deleteError.message}`)
    }

    revalidatePath(`/projects/${rawDelivery.project_id}`)
    return { success: true }
  } catch (error) {
    console.error("Resolve raw delivery error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
