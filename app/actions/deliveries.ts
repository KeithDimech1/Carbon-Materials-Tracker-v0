"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/database.types"

type DeliveryInsert = Database["public"]["Tables"]["deliveries"]["Insert"]

export async function createDelivery(formData: FormData) {
  const supabase = createServerClient()

  const delivery: DeliveryInsert = {
    project_id: formData.get("project_id") as string,
    material_id: formData.get("material_id") as string,
    supplier_id: formData.get("supplier_id") as string,
    contractor_id: formData.get("contractor_id") as string,
    cost_code_id: (formData.get("cost_code_id") as string) || null,
    location_id: (formData.get("location_id") as string) || null,
    quantity: Number.parseFloat(formData.get("quantity") as string),
    delivery_date: formData.get("delivery_date") as string,
    embodied_co2: 0, // Will be calculated based on material emission factor
  }

  // Get material emission factor to calculate embodied CO2
  const { data: material, error: materialError } = await supabase
    .from("materials")
    .select("emission_factor")
    .eq("id", delivery.material_id)
    .single()

  if (materialError) {
    return { error: "Failed to fetch material data" }
  }

  // Calculate embodied CO2
  delivery.embodied_co2 = delivery.quantity * material.emission_factor

  const { data, error } = await supabase.from("deliveries").insert(delivery).select().single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/deliveries")
  revalidatePath("/")

  return { success: true, data }
}

export async function bulkCreateDeliveries(deliveries: DeliveryInsert[]) {
  const supabase = createServerClient()

  // Calculate embodied CO2 for each delivery
  for (const delivery of deliveries) {
    const { data: material, error: materialError } = await supabase
      .from("materials")
      .select("emission_factor")
      .eq("id", delivery.material_id)
      .single()

    if (!materialError && material) {
      delivery.embodied_co2 = delivery.quantity * material.emission_factor
    }
  }

  const { data, error } = await supabase.from("deliveries").insert(deliveries).select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/deliveries")
  revalidatePath("/")

  return { success: true, data }
}
