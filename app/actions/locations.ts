"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createLocation(formData: FormData) {
  try {
    const supabase = createServerClient()

    const locationData = {
      project_id: Number.parseInt(formData.get("project_id") as string),
      location_name: formData.get("location_name") as string,
      description: formData.get("description") as string,
      location_number: formData.get("location_number") as string,
      latitude: formData.get("latitude") ? Number.parseFloat(formData.get("latitude") as string) : null,
      longitude: formData.get("longitude") ? Number.parseFloat(formData.get("longitude") as string) : null,
      location_type_id: formData.get("location_type_id") as string,
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

export async function bulkCreateLocations(
  projectId: string,
  locations: any[],
  locationTypeId: string,
  projectLatitude?: number,
  projectLongitude?: number,
) {
  try {
    const supabase = createServerClient()

    console.log("Raw locations data:", locations) // Debug log

    const locationData = locations.map((loc) => {
      // Handle multiple possible field name variations from CSV
      const locationName = loc.location_name || loc["Location Name"] || loc.locationName || loc.name || loc.Name || ""

      const description = loc.description || loc["Description"] || loc.desc || loc.Desc || ""

      const locationNumber =
        loc.location_number || loc["Location Number"] || loc.locationNumber || loc.number || loc.Number || ""

      const mapped = {
        project_id: Number.parseInt(projectId),
        location_name: locationName,
        description: description,
        location_number: locationNumber,
        // Assign project coordinates by default, can be edited later
        latitude: projectLatitude || null,
        longitude: projectLongitude || null,
        location_type_id: locationTypeId,
      }

      console.log("Mapped location:", mapped) // Debug log
      return mapped
    })

    console.log("Final location data to insert:", locationData) // Debug log

    // Validate that we have location names
    const invalidLocations = locationData.filter((loc) => !loc.location_name || loc.location_name.trim() === "")
    if (invalidLocations.length > 0) {
      return { error: `${invalidLocations.length} locations are missing names. Please check your CSV file.` }
    }

    const { data, error } = await supabase.from("locations").insert(locationData).select()

    if (error) {
      console.error("Database error:", error) // Debug log
      return { error: error.message }
    }

    revalidatePath(`/projects/${projectId}`)
    return { success: true, data }
  } catch (error) {
    console.error("Action error:", error) // Debug log
    return { error: "Failed to create locations" }
  }
}

export async function updateLocationCoordinates(locationId: number, latitude: number, longitude: number) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("locations")
      .update({ latitude, longitude })
      .eq("location_id", locationId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { error: "Failed to update location coordinates" }
  }
}
