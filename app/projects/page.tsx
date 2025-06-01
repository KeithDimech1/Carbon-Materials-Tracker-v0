import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { getProjects } from "@/lib/queries"
import { ProjectsClient } from "./projects-client"

// Helper function to get emissions from delivery data
function getEmissionsFromDelivery(delivery: any): number {
  const emissionColumns = ["embodied_co2", "co2_emissions", "emissions", "carbon_emissions"]
  for (const col of emissionColumns) {
    if (col in delivery && typeof delivery[col] === "number") {
      return delivery[col]
    }
  }
  return 0
}

// Helper function to get date from project data
function getProjectDate(project: any): string | null {
  const dateColumns = ["start_date", "created_at", "date", "timestamp"]
  for (const col of dateColumns) {
    if (col in project && project[col]) {
      return project[col]
    }
  }
  return null
}

export default async function ProjectsPage() {
  try {
    const projects = await getProjects()
    return <ProjectsClient projects={projects} />
  } catch (error) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Projects</h1>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Database Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Unable to load projects. Please check your database connection.
              </p>
              <Button asChild>
                <a href="/inspect-db">Inspect Database</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    )
  }
}
