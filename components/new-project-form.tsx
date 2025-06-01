"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { createProject } from "@/app/actions/projects"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPicker } from "@/components/map-picker"
import { useToast } from "@/hooks/use-toast"
import { getProjectStatuses } from "@/lib/queries"

interface NewProjectFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const initialState = {
  success: false,
  error: null,
  data: null,
}

export function NewProjectForm({ open, onOpenChange }: NewProjectFormProps) {
  const [coordinates, setCoordinates] = useState("")
  const [projectStatusId, setProjectStatusId] = useState("")
  const [projectStatuses, setProjectStatuses] = useState<{ id: number; name: string }[]>([])
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false)
  const { toast } = useToast()

  const [state, formAction, isPending] = useActionState(createProject, initialState)

  // Fetch project statuses when the form opens
  useEffect(() => {
    if (open) {
      const fetchProjectStatuses = async () => {
        setIsLoadingStatuses(true)
        try {
          const statuses = await getProjectStatuses()
          setProjectStatuses(statuses)
          // Set default status if available
          if (statuses.length > 0 && !projectStatusId) {
            const planningStatus = statuses.find(
              (s) => s.name.toLowerCase() === "planning" || s.name.toLowerCase() === "planned",
            )
            setProjectStatusId(planningStatus?.id.toString() || statuses[0].id.toString())
          }
        } catch (error) {
          console.error("Failed to fetch project statuses:", error)
        } finally {
          setIsLoadingStatuses(false)
        }
      }

      fetchProjectStatuses()
    }
  }, [open, projectStatusId])

  // Handle form submission result with useEffect to prevent re-renders
  useEffect(() => {
    if (state?.success && state.data) {
      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
        variant: "default",
      })
      onOpenChange(false)
      // Reset form state
      setCoordinates("")
      setProjectStatusId("")
    } else if (state?.error) {
      toast({
        title: "Error creating project",
        description: state.error,
        variant: "destructive",
      })
    }
  }, [state, toast, onOpenChange])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setCoordinates("")
      setProjectStatusId("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Add a new construction project to track carbon emissions.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input id="name" name="name" placeholder="Enter project name" required disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectNumber">Project Number</Label>
                <Input id="projectNumber" name="projectNumber" placeholder="e.g., PRJ-2023-001" disabled={isPending} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" name="endDate" type="date" disabled={isPending} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectStatusId">Project Status</Label>
              <Select
                name="projectStatusId"
                value={projectStatusId}
                onValueChange={setProjectStatusId}
                disabled={isPending || isLoadingStatuses}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingStatuses ? "Loading statuses..." : "Select status"} />
                </SelectTrigger>
                <SelectContent>
                  {projectStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id.toString()}>
                      {status.name}
                    </SelectItem>
                  ))}
                  {projectStatuses.length === 0 && !isLoadingStatuses && (
                    <SelectItem value="default" disabled>
                      No statuses available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter project description"
                className="min-h-[100px]"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label>Project Location</Label>
              <MapPicker value={coordinates} onChange={setCoordinates} />
              <Input type="hidden" name="coordinates" value={coordinates} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
