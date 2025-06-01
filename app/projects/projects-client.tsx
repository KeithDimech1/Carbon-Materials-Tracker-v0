"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Building2, Calendar, MapPin, AlertCircle } from "lucide-react"
import { NewProjectForm } from "@/components/new-project-form"
import Link from "next/link"

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
  const dateColumns = ["start_date", "created_date", "date", "timestamp"]
  for (const col of dateColumns) {
    if (col in project && project[col]) {
      return project[col]
    }
  }
  return null
}

interface ProjectsClientProps {
  projects: any[]
}

export function ProjectsClient({ projects = [] }: ProjectsClientProps) {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter projects based on search query
  const filteredProjects = projects.filter(
    (project) =>
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.Description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.project_number?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Projects</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-8 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={() => setIsNewProjectOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        {filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid gap-6">
            {filteredProjects.map((project) => {
              const totalEmissions =
                project.deliveries?.reduce((sum, delivery) => sum + getEmissionsFromDelivery(delivery), 0) || 0
              const deliveryCount = project.deliveries?.length || 0
              const packageCount = project.design_packages?.length || 0
              const projectDate = getProjectDate(project)

              return (
                <Link key={project.project_id} href={`/projects/${project.project_id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {project.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4">
                            {project.latitude && project.longitude && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {project.latitude.toFixed(4)}, {project.longitude.toFixed(4)}
                              </span>
                            )}
                            {projectDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(projectDate).toLocaleDateString()}
                              </span>
                            )}
                            {project.project_number && (
                              <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                                {project.project_number}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{project.status_name || "Planning"}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {project.Description && (
                          <div className="md:col-span-4 mb-4">
                            <p className="text-sm text-muted-foreground">{project.Description}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Emissions</p>
                          <p className="text-lg font-semibold">{(totalEmissions / 1000).toFixed(1)} tCO₂e</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Deliveries</p>
                          <p className="text-lg font-semibold">{deliveryCount}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Design Packages</p>
                          <p className="text-lg font-semibold">{packageCount}</p>
                        </div>
                        <div className="flex items-end">
                          <span className="text-sm text-muted-foreground ml-auto">Click to view details →</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "No projects match your search criteria."
                    : "No projects are available in your database. Create your first project."}
                </p>
                <Button onClick={() => setIsNewProjectOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <NewProjectForm open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen} />
    </SidebarInset>
  )
}
