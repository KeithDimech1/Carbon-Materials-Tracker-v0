import { supabase } from "@/lib/supabase"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database } from "lucide-react"

async function testDatabaseConnection() {
  try {
    // Test basic connection with a simple query
    const { data, error } = await supabase.from("projects").select("*").limit(1)

    if (error) {
      return { success: false, error: error.message }
    }

    // Get table counts
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
    const tableCounts = {}

    for (const table of tables) {
      try {
        const { count, error: countError } = await supabase.from(table).select("*", { count: "exact", head: true })

        if (!countError) {
          tableCounts[table] = count || 0
        } else {
          tableCounts[table] = `Error: ${countError.message}`
        }
      } catch (e) {
        tableCounts[table] = "Table not found"
      }
    }

    return { success: true, tableCounts }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export default async function TestConnectionPage() {
  const connectionTest = await testDatabaseConnection()

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Database Connection Test</h1>
      </header>

      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Supabase Connection Status
            </CardTitle>
            <CardDescription>Testing connection to carbon_material_tracker database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              {connectionTest.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">Connected Successfully</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-600">Connection Failed</span>
                </>
              )}
            </div>

            {connectionTest.success && connectionTest.tableCounts && (
              <div className="space-y-3">
                <h4 className="font-medium">Table Counts:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(connectionTest.tableCounts).map(([table, count]) => (
                    <div key={table} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium capitalize">{table}</span>
                      <Badge variant={typeof count === "string" && count.includes("Error") ? "destructive" : "default"}>
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!connectionTest.success && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">Error Details:</p>
                <p className="text-red-600 text-sm mt-1">{connectionTest.error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Project:</span>
                <p>carbon_material_tracker</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Host:</span>
                <p>db.qqglnbosqfeucqlqnadb.supabase.co</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">URL:</span>
                <p>https://qqglnbosqfeucqlqnadb.supabase.co</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">SSL:</span>
                <p>Required</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
