import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Upload, Package } from "lucide-react"
import { MaterialLibraryClient } from "./material-library-client"
import { getMaterialLibrary } from "@/lib/queries"

export default async function MaterialLibraryPage() {
  try {
    const materials = await getMaterialLibrary()

    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-pathway-gold/20 px-4 bg-pathway-green/5">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-pathway-gold/30" />
          <h1 className="text-lg font-semibold text-pathway-green">Material Library</h1>
          <div className="ml-auto">
            <Button size="sm" className="bg-pathway-green hover:bg-pathway-green/90 text-pathway-cream">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
          </div>
        </header>

        <MaterialLibraryClient materials={materials} />
      </SidebarInset>
    )
  } catch (error) {
    console.error("Error loading material library:", error)
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-pathway-gold/20 px-4 bg-pathway-green/5">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-pathway-gold/30" />
          <h1 className="text-lg font-semibold text-pathway-green">Material Library</h1>
        </header>

        <div className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Material Library
              </CardTitle>
              <CardDescription>Centralized repository of materials and their carbon emission factors</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Materials</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                There was an error loading the material library. Please check your database connection.
              </p>
              <Button asChild>
                <a href="/test-connection">Test Connection</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    )
  }
}
