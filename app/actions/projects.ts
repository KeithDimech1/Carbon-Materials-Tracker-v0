"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createProject(prevState: any, formData: FormData | null) {
  try {
    // Handle case where formData is null (initial state)
    if (!formData) {
      return { success: false, error: null }
    }

    const supabase = createServerClient()

    // Extract form data
    const name = formData.get("name") as string
    const projectNumber = formData.get("projectNumber") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const coordinates = formData.get("coordinates") as string
    const description = formData.get("description") as string
    const projectStatusId = Number.parseInt(formData.get("projectStatusId") as string) || null

    // Split coordinates into latitude and longitude
    let latitude = null
    let longitude = null
    if (coordinates) {
      const [lat, lng] = coordinates.split(",")
      latitude = Number.parseFloat(lat)
      longitude = Number.parseFloat(lng)
    }

    // Validate required fields
    if (!name) {
      return { success: false, error: "Project name is required" }
    }

    // Create project object matching your actual schema
    const projectData = {
      name,
      project_number: projectNumber || null,
      Description: description || null, // Note the capitalized field name
      latitude: latitude || null,
      longitude: longitude || null,
      start_date: startDate || null,
      end_date: endDate || null,
      project_status_id: projectStatusId,
      // principal_id would need to be set based on the authenticated user
      created_date: new Date().toISOString(),
    }

    // Create project in Supabase
    const { data, error } = await supabase.from("projects").insert(projectData).select().single()

    if (error) {
      console.error("Error creating project:", error)
      return { success: false, error: error.message }
    }

    // Revalidate relevant paths
    revalidatePath("/projects")
    revalidatePath("/")

    return { success: true, data, error: null }
  } catch (error) {
    console.error("Project creation error:", error)
    return { success: false, error: "Failed to create project" }
  }
}
