"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { MapPin, Globe } from "lucide-react"

interface MapPickerProps {
  value?: string
  onChange: (coordinates: string) => void
}

export function MapPicker({ value = "", onChange }: MapPickerProps) {
  const [coordinates, setCoordinates] = useState(value)

  const handleLatChange = (lat: string) => {
    const lng = coordinates ? coordinates.split(",")[1] : "0"
    const newCoords = `${lat},${lng}`
    setCoordinates(newCoords)
    onChange(newCoords)
  }

  const handleLngChange = (lng: string) => {
    const lat = coordinates ? coordinates.split(",")[0] : "0"
    const newCoords = `${lat},${lng}`
    setCoordinates(newCoords)
    onChange(newCoords)
  }

  const handleMapClick = () => {
    // Simulate selecting coordinates
    const lat = (51.505 + (Math.random() - 0.5) * 0.1).toFixed(6)
    const lng = (-0.09 + (Math.random() - 0.5) * 0.1).toFixed(6)
    const newCoords = `${lat},${lng}`
    setCoordinates(newCoords)
    onChange(newCoords)
  }

  return (
    <div className="space-y-4">
      <Card
        className="relative w-full h-[200px] cursor-pointer overflow-hidden border-2 border-dashed hover:border-primary/50 transition-colors"
        onClick={handleMapClick}
      >
        {/* Grid pattern background to simulate a map */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />
          {/* Simulate some geographic features */}
          <div className="absolute top-4 left-8 w-16 h-8 bg-blue-200 rounded-full opacity-60" />
          <div className="absolute bottom-8 right-12 w-20 h-12 bg-green-200 rounded-lg opacity-60" />
          <div className="absolute top-12 right-8 w-12 h-6 bg-yellow-200 rounded opacity-60" />
        </div>

        {/* Map pin at selected location */}
        {coordinates && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary z-10">
            <MapPin className="h-8 w-8 drop-shadow-lg" fill="currentColor" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center z-5">
          <div className="text-center">
            {!coordinates && (
              <>
                <Globe className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Click to select location</p>
                <p className="text-xs text-muted-foreground">Choose project coordinates</p>
              </>
            )}
          </div>
        </div>

        {coordinates && (
          <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm p-2 text-xs rounded border">
            <p className="font-medium">Selected Location</p>
            <p className="font-mono text-muted-foreground">{coordinates}</p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            placeholder="51.505"
            value={coordinates ? coordinates.split(",")[0] : ""}
            onChange={(e) => handleLatChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            placeholder="-0.09"
            value={coordinates ? coordinates.split(",")[1] : ""}
            onChange={(e) => handleLngChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
