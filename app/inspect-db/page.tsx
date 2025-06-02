import { supabase } from "@/lib/supabase"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

async function inspectDatabase() {
  try {
    // Get a sample from each table to see the actual structure
    const tables = [
      "projects",
      "materials",
      "deliveries",
      "suppliers",
      "contractors",
      "cost_codes",
      "locations",
      "design_packages",
    ]
    const results = {}

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1)
        if (error) {
          results[table] = { error: error.message }
        } else {
          results[table] = {
            exists: true,
            columns: data && data.length > 0 ? Object.keys(data[0]) : [],
            sampleData: data?.[0] || null,
          }
        }
      } catch (e) {
        results[table] = { error: e.message }
      }
    }

    return results
  } catch (error) {
    return { error: error.message }
  }
}

export default async function InspectDatabasePage() {
  const inspection = await inspectDatabase()

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-pathway-gold/20 px-4 bg-pathway-green/5">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-pathway-gold/30" />
        <h1 className="text-lg font-semibold text-pathway-green">Database Inspector</h1>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-6">
          {Object.entries(inspection).map(([table, info]) => (
            <Card key={table} className="border-pathway-gold/20">
              <CardHeader>
                <CardTitle className="capitalize text-pathway-green">{table}</CardTitle>
                <CardDescription className="text-pathway-green/70">
                  {info.error ? "Error accessing table" : `${info.columns?.length || 0} columns found`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {info.error ? (
                  <div className="text-red-600 text-sm">
                    <strong>Error:</strong> {info.error}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Columns:</h4>
                      <div className="flex flex-wrap gap-2">
                        {info.columns?.map((col) => (
                          <span
                            key={col}
                            className="px-2 py-1 bg-pathway-gold/20 text-pathway-green rounded text-sm font-mono border border-pathway-gold/30"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                    {info.sampleData && (
                      <div>
                        <h4 className="font-medium mb-2">Sample Data:</h4>
                        <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                          {JSON.stringify(info.sampleData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SidebarInset>
  )
}
