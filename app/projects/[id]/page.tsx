import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { getProjectById, getDeliveries, getCostCodes, getLocations } from "@/lib/queries"
import Link from "next/link"
import { ProjectDetailsClient } from "./project-details-client"

interface ProjectDetailsPageProps {
  params: {
    id: string
  }
}

export default async function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  try {
    // Fetch project first, then try other tables
    const project = await getProjectById(params.id)

    if (!project) {
      return (
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </header>
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
                  <p className="text-muted-foreground">The requested project could not be found.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      )
    }

    // Try to fetch related data, but don't fail if tables don't exist
    const [deliveries, costCodes, locations] = await Promise.allSettled([
      getDeliveries(params.id),
      getCostCodes(params.id),
      getLocations(params.id),
    ])

    // Extract data or use empty arrays if failed
    const deliveriesData = deliveries.status === "fulfilled" ? deliveries.value : []
    const costCodesData = costCodes.status === "fulfilled" ? costCodes.value : []
    const locationsData = locations.status === "fulfilled" ? locations.value : []

    return (
      <ProjectDetailsClient
        project={project}
        deliveries={deliveriesData}
        costCodes={costCodesData}
        locations={locationsData}
      />
    )
  } catch (error) {
    console.error("Error in ProjectDetailsPage:", error)
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Project</h3>
                <p className="text-muted-foreground">Unable to load project details. Please try again.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    )
  }
}
