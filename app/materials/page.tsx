import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Package, Leaf } from "lucide-react"

export default function MaterialsPage() {
  const materials = [
    {
      id: 1,
      name: "Concrete (40 MPa)",
      category: "Structural",
      unit: "m³",
      emissionFactor: "337.2 kgCO₂e/m³",
      recycledContent: "15%",
      strength: "40 MPa",
      supplier: "ABC Concrete Co.",
      totalUsed: "1,247.8 m³",
      totalEmissions: "420.9 tCO₂e",
    },
    {
      id: 2,
      name: "Steel Reinforcement",
      category: "Structural",
      unit: "tonne",
      emissionFactor: "2,280 kgCO₂e/tonne",
      recycledContent: "85%",
      strength: "500 MPa",
      supplier: "Steel Solutions",
      totalUsed: "89.4 tonnes",
      totalEmissions: "203.8 tCO₂e",
    },
    {
      id: 3,
      name: "Structural Steel",
      category: "Structural",
      unit: "tonne",
      emissionFactor: "1,950 kgCO₂e/tonne",
      recycledContent: "70%",
      strength: "350 MPa",
      supplier: "MetalWorks Inc.",
      totalUsed: "67.2 tonnes",
      totalEmissions: "131.0 tCO₂e",
    },
  ]

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-pathway-gold/20 px-4 bg-pathway-green/5">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-pathway-gold/30" />
        <h1 className="text-lg font-semibold text-pathway-green">Materials</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-pathway-green/50" />
            <Input
              placeholder="Search materials..."
              className="pl-8 w-64 border-pathway-gold/30 focus:border-pathway-gold"
            />
          </div>
          <Button size="sm" className="bg-pathway-green hover:bg-pathway-green/90 text-pathway-cream">
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-6">
          {materials.map((material) => (
            <Card key={material.id} className="hover:shadow-md transition-shadow border-pathway-gold/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-pathway-green">
                      <Package className="h-5 w-5 text-pathway-gold" />
                      {material.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <Badge
                        variant="secondary"
                        className="bg-pathway-gold/20 text-pathway-green border-pathway-gold/30"
                      >
                        {material.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-pathway-green/70">
                        <Leaf className="h-3 w-3 text-green-600" />
                        {material.recycledContent} recycled
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono border-pathway-gold text-pathway-green">
                    {material.emissionFactor}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Unit</p>
                    <p className="font-semibold">{material.unit}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Strength</p>
                    <p className="font-semibold">{material.strength}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Total Used</p>
                    <p className="font-semibold">{material.totalUsed}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Total Emissions</p>
                    <p className="font-semibold text-orange-600">{material.totalEmissions}</p>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" size="sm" className="ml-auto">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SidebarInset>
  )
}
