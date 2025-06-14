import { supabase } from "./supabase"
import type { Database } from "./database.types"

type Tables = Database["public"]["Tables"]

// Helper function to safely get columns that exist
async function getTableColumns(tableName: string) {
  try {
    const { data, error } = await supabase.from(tableName).select("*").limit(1)
    if (error || !data || data.length === 0) return []
    return Object.keys(data[0])
  } catch {
    return []
  }
}

// Projects queries
export async function getProjects() {
  try {
    // Start with basic project data - no assumptions about column names
    const { data: projects, error } = await supabase.from("projects").select(`
        *,
        project_statuses (
          id,
          name
        )
      `)

    if (error) {
      console.error("Error fetching projects:", error)
      throw new Error(`Failed to fetch projects: ${error.message}`)
    }

    // Process the joined data
    const processedProjects =
      projects?.map((project) => {
        // Add status_name from the joined project_statuses
        const statusName = project.project_statuses?.name || null

        return {
          ...project,
          status_name: statusName,
        }
      }) || []

    // Try to get related data if tables exist
    const projectsWithRelations = []

    for (const project of processedProjects) {
      const projectData = { ...project, deliveries: [], design_packages: [] }
      const projectId = project.project_id || project.id // Handle both id formats

      // Try to get deliveries
      try {
        const { data: deliveries } = await supabase
          .from("deliveries")
          .select("*")
          .eq("project_id", projectId.toString())
        projectData.deliveries = deliveries || []
      } catch (e) {
        console.log("Deliveries table not accessible:", e)
      }

      // Try to get design packages
      try {
        const { data: packages } = await supabase
          .from("design_packages")
          .select("*")
          .eq("project_id", projectId.toString())
        projectData.design_packages = packages || []
      } catch (e) {
        console.log("Design packages table not accessible:", e)
      }

      projectsWithRelations.push(projectData)
    }

    return projectsWithRelations
  } catch (error) {
    console.error("Projects query error:", error)
    throw error
  }
}

export async function getProjectById(id: string | number) {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        project_statuses (
          id,
          name
        )
      `)
      .eq("project_id", id)
      .single()

    if (error) {
      console.error("Error fetching project:", error)
      throw new Error(`Failed to fetch project: ${error.message}`)
    }

    // Add status_name from the joined project_statuses
    const statusName = data.project_statuses?.name || null

    return {
      ...data,
      status_name: statusName,
    }
  } catch (error) {
    console.error("Project query error:", error)
    throw error
  }
}

// Deliveries queries
export async function getDeliveries(projectId?: string) {
  try {
    let query = supabase.from("deliveries").select("*")

    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    const { data, error } = await query
    if (error) {
      console.error("Error fetching deliveries:", error)
      throw new Error(`Failed to fetch deliveries: ${error.message}`)
    }
    return data || []
  } catch (error) {
    console.error("Deliveries query error:", error)
    throw error
  }
}

export async function createDelivery(delivery: any) {
  try {
    const { data, error } = await supabase.from("deliveries").insert(delivery).select().single()

    if (error) {
      console.error("Error creating delivery:", error)
      throw new Error(`Failed to create delivery: ${error.message}`)
    }
    return data
  } catch (error) {
    console.error("Create delivery error:", error)
    throw error
  }
}

// Materials queries
export async function getMaterials() {
  try {
    // First, get materials without relations
    const { data: materials, error } = await supabase.from("materials").select("*")

    if (error) {
      console.error("Error fetching materials:", error)
      throw new Error(`Failed to fetch materials: ${error.message}`)
    }

    // Try to add delivery data if deliveries table exists
    const materialsWithDeliveries = []

    for (const material of materials || []) {
      const materialData = { ...material, deliveries: [] }

      try {
        const { data: deliveries } = await supabase.from("deliveries").select("*").eq("material_id", material.id)
        materialData.deliveries = deliveries || []
      } catch (e) {
        console.log("Could not fetch deliveries for material:", e)
      }

      materialsWithDeliveries.push(materialData)
    }

    return materialsWithDeliveries
  } catch (error) {
    console.error("Materials query error:", error)
    throw error
  }
}

// Dashboard aggregations
export async function getDashboardStats() {
  try {
    const stats = {
      totalEmissions: 0,
      activeProjects: 0,
      recentDeliveries: 0,
      materialsCount: 0,
    }

    // Get total emissions - check what columns exist in deliveries
    try {
      const { data: deliveries } = await supabase.from("deliveries").select("*")
      if (deliveries && deliveries.length > 0) {
        // Look for common emission column names
        const emissionColumns = ["embodied_co2", "co2_emissions", "emissions", "carbon_emissions"]
        const firstDelivery = deliveries[0]
        let emissionColumn = null

        if (firstDelivery) {
          emissionColumn = emissionColumns.find((col) => col in firstDelivery)
        }

        if (emissionColumn) {
          stats.totalEmissions = deliveries.reduce((sum, delivery) => sum + (delivery[emissionColumn] || 0), 0)
        }
      }
    } catch (e) {
      console.log("Could not fetch emissions data:", e)
    }

    // Get active projects count
    try {
      const { data: projects } = await supabase.from("projects").select("*")
      if (projects) {
        // Look for status column
        const activeProjects = projects.filter(
          (p) => p.status === "active" || p.status === "Active" || p.status === "ACTIVE",
        )
        stats.activeProjects = activeProjects.length
      }
    } catch (e) {
      console.log("Could not fetch active projects:", e)
    }

    // Get recent deliveries count (this week)
    try {
      const { data: deliveries } = await supabase.from("deliveries").select("*")
      if (deliveries && deliveries.length > 0) {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        // Look for date columns
        const dateColumns = ["delivery_date", "date", "created_at", "timestamp"]
        const firstDelivery = deliveries[0]
        let dateColumn = null

        if (firstDelivery) {
          dateColumn = dateColumns.find((col) => col in firstDelivery)
        }

        if (dateColumn) {
          const recentDeliveries = deliveries.filter((delivery) => {
            const deliveryDate = new Date(delivery[dateColumn])
            return deliveryDate >= oneWeekAgo
          })
          stats.recentDeliveries = recentDeliveries.length
        } else {
          stats.recentDeliveries = deliveries.length // fallback to total count
        }
      }
    } catch (e) {
      console.log("Could not fetch recent deliveries:", e)
    }

    // Get materials count
    try {
      const { count } = await supabase.from("materials").select("*", { count: "exact", head: true })
      stats.materialsCount = count || 0
    } catch (e) {
      console.log("Could not fetch materials count:", e)
    }

    return stats
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return {
      totalEmissions: 0,
      activeProjects: 0,
      recentDeliveries: 0,
      materialsCount: 0,
    }
  }
}

// Suppliers and contractors
export async function getSuppliers() {
  try {
    const { data, error } = await supabase.from("suppliers").select("*")

    if (error) {
      console.error("Error fetching suppliers:", error)
      throw new Error(`Failed to fetch suppliers: ${error.message}`)
    }
    return data || []
  } catch (error) {
    console.error("Suppliers query error:", error)
    throw error
  }
}

export async function getContractors() {
  try {
    const { data, error } = await supabase.from("contractors").select("*")

    if (error) {
      console.error("Error fetching contractors:", error)
      throw new Error(`Failed to fetch contractors: ${error.message}`)
    }
    return data || []
  } catch (error) {
    console.error("Contractors query error:", error)
    throw error
  }
}

// Updated to use project_cost_codes table
export async function getCostCodes(projectId?: string) {
  try {
    // First check if the table exists by trying a simple query
    const { data: tableCheck, error: tableError } = await supabase
      .from("project_cost_codes")
      .select("cost_code_id")
      .limit(1)

    // If table doesn't exist, return empty array
    if (tableError && tableError.message.includes("does not exist")) {
      console.log("Project cost codes table does not exist yet")
      return []
    }

    let query = supabase.from("project_cost_codes").select("*")

    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    const { data, error } = await query
    if (error) {
      console.error("Error fetching project cost codes:", error)
      return [] // Return empty array instead of throwing
    }
    return data || []
  } catch (error) {
    console.error("Project cost codes query error:", error)
    return [] // Return empty array for any error
  }
}

// Updated locations query with location types
export async function getLocations(projectId?: string) {
  try {
    // First check if the table exists by trying a simple query
    const { data: tableCheck, error: tableError } = await supabase.from("locations").select("location_id").limit(1)

    // If table doesn't exist, return empty array
    if (tableError && tableError.message.includes("does not exist")) {
      console.log("Locations table does not exist yet")
      return []
    }

    let query = supabase.from("locations").select(`
      *,
      location_types (
        id,
        LocationType
      )
    `)

    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    const { data, error } = await query
    if (error) {
      console.error("Error fetching locations:", error)
      return [] // Return empty array instead of throwing
    }
    return data || []
  } catch (error) {
    console.error("Locations query error:", error)
    return [] // Return empty array for any error
  }
}

// Location types queries
export async function getLocationTypes() {
  try {
    const { data, error } = await supabase.from("location_types").select("*").order("LocationType")

    if (error) {
      console.error("Error fetching location types:", error)
      return [] // Return empty array instead of throwing
    }
    return data || []
  } catch (error) {
    console.error("Location types query error:", error)
    return [] // Return empty array as fallback
  }
}

// Project statuses queries
export async function getProjectStatuses() {
  try {
    const { data, error } = await supabase.from("project_statuses").select("*")

    if (error) {
      console.error("Error fetching project statuses:", error)
      throw new Error(`Failed to fetch project statuses: ${error.message}`)
    }
    return data || []
  } catch (error) {
    console.error("Project statuses query error:", error)
    return [] // Return empty array as fallback
  }
}

// Materials library queries - Fixed to properly handle the relationships
export async function getMaterialLibrary() {
  try {
    console.log("Starting getMaterialLibrary query...")

    // Get materials with all their data
    const { data: materials, error } = await supabase.from("materials").select("*").order("material_name")

    if (error) {
      console.error("Error fetching materials:", error)
      throw new Error(`Failed to fetch materials: ${error.message}`)
    }

    console.log(`Found ${materials?.length || 0} materials`)

    if (!materials || materials.length === 0) {
      return []
    }

    // Get all the reference data we need for lookups
    console.log("Fetching reference data...")

    const [
      materialTypesResult,
      materialSubtypesResult,
      suppliersResult,
      unitsResult,
      genericMaterialsResult,
      transportModesResult,
      emissionSourcesResult,
    ] = await Promise.allSettled([
      supabase.from("material_types").select("*"),
      supabase.from("material_subtypes").select("*"),
      supabase.from("suppliers").select("*"),
      supabase.from("units").select("*"),
      supabase.from("generic_materials").select("*"),
      supabase.from("transport_modes").select("*"),
      supabase.from("emission_source").select("*"),
    ])

    // Safely extract data from results
    const materialTypes = materialTypesResult.status === "fulfilled" ? materialTypesResult.value.data || [] : []
    const materialSubtypes =
      materialSubtypesResult.status === "fulfilled" ? materialSubtypesResult.value.data || [] : []
    const suppliers = suppliersResult.status === "fulfilled" ? suppliersResult.value.data || [] : []
    const units = unitsResult.status === "fulfilled" ? unitsResult.value.data || [] : []
    const genericMaterials =
      genericMaterialsResult.status === "fulfilled" ? genericMaterialsResult.value.data || [] : []
    const transportModes = transportModesResult.status === "fulfilled" ? transportModesResult.value.data || [] : []
    const emissionSources = emissionSourcesResult.status === "fulfilled" ? emissionSourcesResult.value.data || [] : []

    console.log("Reference data counts:", {
      materialTypes: materialTypes.length,
      materialSubtypes: materialSubtypes.length,
      suppliers: suppliers.length,
      units: units.length,
      genericMaterials: genericMaterials.length,
      transportModes: transportModes.length,
      emissionSources: emissionSources.length,
    })

    // Create lookup maps for reference data
    const materialTypeMap = new Map(materialTypes.map((t) => [t.material_type_id, t.material_type_name]))
    const materialSubtypeMap = new Map(materialSubtypes.map((t) => [t.material_subtype_id, t.material_subtype_name]))
    const supplierMap = new Map(suppliers.map((s) => [s.supplier_id, s.supplier_name]))
    const unitMap = new Map(units.map((u) => [u.unit_id, { name: u.unit_name, symbol: u.unit_symbol }]))
    const genericMaterialMap = new Map(genericMaterials.map((g) => [g.generic_material_id, g.display_name]))
    const transportModeMap = new Map(transportModes.map((t) => [t.transport_mode_id, t.transport_mode_name]))
    const emissionSourceMap = new Map(emissionSources.map((e) => [e.source_id, e.emission_source_name]))

    console.log("Processing materials with lookup data...")

    // Process the materials with their related data
    const processedMaterials = materials.map((material) => {
      const unit = unitMap.get(material.unit_id)
      const materialType = materialTypeMap.get(material.material_type_id)
      const materialSubtype = materialSubtypeMap.get(material.material_subtype_id)
      const supplier = supplierMap.get(material.supplier_id)
      const emissionSource = emissionSourceMap.get(material.emission_source_id)

      console.log(`Processing material ${material.material_name}:`, {
        material_type_id: material.material_type_id,
        materialType,
        supplier_id: material.supplier_id,
        supplier,
        unit_id: material.unit_id,
        unit,
      })

      return {
        material_id: material.material_id,
        material_name: material.material_name,
        material_type: materialType || null,
        material_subtype: materialSubtype || null,
        supplier: supplier || null,
        generic_material: genericMaterialMap.get(material.generic_material_id) || null,
        unit: unit?.symbol || unit?.name || null,
        unit_symbol: unit?.symbol || null,
        embodied_co2_t_per_unit: material.embodied_co2_t_per_unit,
        transport_mode: transportModeMap.get(material.transport_mode_id) || null,
        evidence_url: material.material_evidence_url,
        emission_source: emissionSource || null,
        date_added: material.created_at,
        created_by: material.created_by,
      }
    })

    console.log(`Processed ${processedMaterials.length} materials`)
    console.log("Sample processed material:", processedMaterials[0])

    return processedMaterials
  } catch (error) {
    console.error("Material library query error:", error)
    throw error
  }
}
