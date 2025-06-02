import { MaterialLibraryClient } from "../material-library/material-library-client"

// Sample materials with different types for testing
const sampleMaterials = [
  {
    material_id: 1,
    material_name: "Portland Cement CEM I 52.5N",
    material_type: "Concrete",
    embodied_co2_t_per_unit: 0.95,
    unit: "kg",
    supplier: "ABC Cement Co",
    emission_source: "EPD Database",
    evidence_url: "https://example.com/cement-epd",
    date_added: "2024-01-15",
  },
  {
    material_id: 2,
    material_name: "Ready Mix Concrete C30/37",
    material_type: "Concrete",
    embodied_co2_t_per_unit: 0.35,
    unit: "m³",
    supplier: "ConcreteWorks Ltd",
    emission_source: "Manufacturer Data",
    evidence_url: "https://example.com/concrete-data",
    date_added: "2024-01-20",
  },
  {
    material_id: 3,
    material_name: "Structural Steel S355",
    material_type: "Steel",
    embodied_co2_t_per_unit: 2.1,
    unit: "kg",
    supplier: "SteelCorp Industries",
    emission_source: "EPD Database",
    evidence_url: "https://example.com/steel-epd",
    date_added: "2024-01-18",
  },
  {
    material_id: 4,
    material_name: "Recycled Steel Rebar",
    material_type: "Steel",
    embodied_co2_t_per_unit: 0.75,
    unit: "kg",
    supplier: "GreenSteel Ltd",
    emission_source: "LCA Study",
    evidence_url: "https://example.com/recycled-steel",
    date_added: "2024-01-22",
  },
  {
    material_id: 5,
    material_name: "Laminated Timber Beam",
    material_type: "Timber",
    embodied_co2_t_per_unit: -0.45,
    unit: "m³",
    supplier: "Sustainable Timber Co",
    emission_source: "FSC Database",
    evidence_url: "https://example.com/timber-data",
    date_added: "2024-01-25",
  },
  {
    material_id: 6,
    material_name: "Cross Laminated Timber (CLT)",
    material_type: "Timber",
    embodied_co2_t_per_unit: -0.35,
    unit: "m³",
    supplier: "CLT Innovations",
    emission_source: "EPD Database",
    evidence_url: "https://example.com/clt-epd",
    date_added: "2024-01-28",
  },
  {
    material_id: 7,
    material_name: "Aluminum Window Frame",
    material_type: "Aluminum",
    embodied_co2_t_per_unit: 8.2,
    unit: "kg",
    supplier: "AlumTech Solutions",
    emission_source: "Industry Average",
    evidence_url: "https://example.com/aluminum-data",
    date_added: "2024-01-30",
  },
  {
    material_id: 8,
    material_name: "Recycled Aluminum Sheet",
    material_type: "Aluminum",
    embodied_co2_t_per_unit: 1.8,
    unit: "kg",
    supplier: "RecycleAl Corp",
    emission_source: "LCA Study",
    evidence_url: "https://example.com/recycled-al",
    date_added: "2024-02-01",
  },
  {
    material_id: 9,
    material_name: "Clay Brick Standard",
    material_type: "Masonry",
    embodied_co2_t_per_unit: 0.24,
    unit: "kg",
    supplier: "Traditional Bricks Ltd",
    emission_source: "Manufacturer Data",
    evidence_url: "https://example.com/brick-data",
    date_added: "2024-02-03",
  },
  {
    material_id: 10,
    material_name: "Autoclaved Aerated Concrete Block",
    material_type: "Masonry",
    embodied_co2_t_per_unit: 0.18,
    unit: "kg",
    supplier: "AAC Building Systems",
    emission_source: "EPD Database",
    evidence_url: "https://example.com/aac-epd",
    date_added: "2024-02-05",
  },
  {
    material_id: 11,
    material_name: "Mineral Wool Insulation",
    material_type: "Insulation",
    embodied_co2_t_per_unit: 1.2,
    unit: "kg",
    supplier: "ThermalTech Ltd",
    emission_source: "EPD Database",
    evidence_url: "https://example.com/insulation-epd",
    date_added: "2024-02-08",
  },
  {
    material_id: 12,
    material_name: "Expanded Polystyrene (EPS)",
    material_type: "Insulation",
    embodied_co2_t_per_unit: 3.4,
    unit: "kg",
    supplier: "Foam Solutions Inc",
    emission_source: "Industry Average",
    evidence_url: "https://example.com/eps-data",
    date_added: "2024-02-10",
  },
]

export default function TestMaterialFilters() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-pathway-cream/50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-pathway-green">Material Library Filter Test</h1>
          <p className="text-muted-foreground mt-1">
            Test the filtering functionality with sample materials across different types
          </p>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 m-6">
          <h3 className="font-semibold text-blue-900 mb-2">🧪 Filter Testing Instructions</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Material Types Available:</strong> Concrete (2), Steel (2), Timber (2), Aluminum (2), Masonry (2),
              Insulation (2)
            </p>
            <p>
              <strong>Emission Sources:</strong> EPD Database, Manufacturer Data, LCA Study, FSC Database, Industry
              Average
            </p>
            <p>
              <strong>Try these tests:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Filter by "Concrete" - should show 2 materials</li>
              <li>Filter by "Steel" - should show 2 materials (including recycled steel)</li>
              <li>Filter by "Timber" - should show 2 materials with negative carbon (carbon sequestration)</li>
              <li>Search for "Recycled" - should show recycled steel and aluminum</li>
              <li>Combine filters: "Steel" + "EPD Database" - should show 1 material</li>
            </ul>
          </div>
        </div>

        <MaterialLibraryClient materials={sampleMaterials} />
      </div>
    </div>
  )
}
