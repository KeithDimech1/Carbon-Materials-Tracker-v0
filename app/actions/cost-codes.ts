"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createCostCode(formData: FormData) {
  try {
    const supabase = createServerClient()

    const costCodeData = {
      project_id: Number.parseInt(formData.get("project_id") as string),
      cost_code_number: formData.get("cost_code_number") as string,
      cost_code_name: formData.get("cost_code_name") as string,
      description: formData.get("description") as string,
    }

    const { data, error } = await supabase.from("project_cost_codes").insert(costCodeData).select().single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/projects/${costCodeData.project_id}`)
    return { success: true, data }
  } catch (error) {
    return { error: "Failed to create cost code" }
  }
}

export async function bulkCreateCostCodes(projectId: string, costCodes: any[]) {
  try {
    const supabase = createServerClient()

    const costCodeData = costCodes.map((cc) => ({
      project_id: Number.parseInt(projectId),
      cost_code_number: cc.cost_code_number || cc["Cost Code Number"] || "",
      cost_code_name: cc.cost_code_name || cc["Cost Code Name"] || "",
      description: cc.description || cc["Description"] || "",
    }))

    const { data, error } = await supabase.from("project_cost_codes").insert(costCodeData).select()

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/projects/${projectId}`)
    return { success: true, data }
  } catch (error) {
    return { error: "Failed to create cost codes" }
  }
}
