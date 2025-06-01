"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createLocation(formData: FormData) {
  try {
    const supabase = createServerClient()

    const locationData = {
      project_id: formData.get("project_id") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      coordinates: formData.get("coordinates") as string,
    }

    const { data, error } = await supabase.from("locations").insert(locationData).select().single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/projects/${locationData.project_id}`)
    return { success: true, data }
  } catch (error) {
    return { error: "Failed to create location" }
  }
}

export async function bulkCreateLocations(projectId: string, locations: any[]) {
  try {
    const supabase = createServerClient()

    const locationData = locations.map((loc) => ({
      project_id: projectId,
      name: loc.name,
      description: loc.description,
      coordinates: loc.coordinates,
    }))

    const { data, error } = await supabase.from("locations").insert(locationData).select()

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/projects/${projectId}`)
    return { success: true, data }
  } catch (error) {
    return { error: "Failed to create locations" }
  }
}
