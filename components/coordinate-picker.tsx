"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Globe, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CoordinatePickerProps {
  initialLatitude?: number
  initialLongitude?: number
  onCoordinatesChange: (latitude: number, longitude: number) => void
  projectLatitude?: number
  projectLongitude?: number
}

export function CoordinatePicker({
  initialLatitude,
  initialLongitude,
  onCoordinatesChange,
  projectLatitude,
  projectLongitude,
}: CoordinatePickerProps) {
  const { toast } = useToast()
  const [latitude, setLatitude] = useState(initialLatitude?.toString() || "")
  const [longitude, setLongitude] = useState(initialLongitude?.toString() || "")
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(
    initialLatitude && initialLongitude ? { lat: initialLatitude, lng: initialLongitude } : null,
  )

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert click position to approximate coordinates
    // This is a simplified conversion - in a real app you'd use a proper map library
    const mapWidth = rect.width
    const mapHeight = rect.height

    // Convert to lat/lng (simplified calculation)
    const baseLat = projectLatitude || 51.505
    const baseLng = projectLongitude || -0.09

    // Create a small area around the project coordinates
    const latRange = 0.01 // ~1km range
    const lngRange = 0.01

    const newLat = baseLat + (y / mapHeight - 0.5) * latRange * 2
    const newLng = baseLng + (x / mapWidth - 0.5) * lngRange * 2

    setSelectedCoords({ lat: newLat, lng: newLng })
    setLatitude(newLat.toFixed(6))
    setLongitude(newLng.toFixed(6))
    onCoordinatesChange(newLat, newLng)
  }

  const handleLatitudeChange = (value: string) => {
    setLatitude(value)
    const lat = Number.parseFloat(value)
    const lng = Number.parseFloat(longitude)
    if (!isNaN(lat) && !isNaN(lng)) {
      setSelectedCoords({ lat, lng })
      onCoordinatesChange(lat, lng)
    }
  }

  const handleLongitudeChange = (value: string) => {
    setLongitude(value)
    const lat = Number.parseFloat(latitude)
    const lng = Number.parseFloat(value)
    if (!isNaN(lat) && !isNaN(lng)) {
      setSelectedCoords({ lat, lng })
      onCoordinatesChange(lat, lng)
    }
  }

  const useProjectCoordinates = () => {
    if (projectLatitude && projectLongitude) {
      setLatitude(projectLatitude.toString())
      setLongitude(projectLongitude.toString())
      setSelectedCoords({ lat: projectLatitude, lng: projectLongitude })
      onCoordinatesChange(projectLatitude, projectLongitude)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Available",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setLatitude(lat.toFixed(6))
        setLongitude(lng.toFixed(6))
        setSelectedCoords({ lat, lng })
        onCoordinatesChange(lat, lng)
        toast({
          title: "Location Found",
          description: "Your current location has been set.",
        })
      },
      (error) => {
        let errorMessage = "Unable to get your location."

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access was denied. Please enable location permissions in your browser."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out."
            break
          default:
            errorMessage = "An unknown error occurred while retrieving location."
            break
        }

        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  return (
    <div className="space-y-4">
      <Card
        className="relative w-full h-[300px] cursor-crosshair overflow-hidden border-2 border-pathway-gold hover:border-pathway-gold/70 transition-colors"
        onClick={handleMapClick}
      >
        {/* Enhanced map background with Pathway colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-pathway-green via-pathway-gold/20 to-pathway-cream/30">
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
              linear-gradient(rgba(26,77,58,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(26,77,58,0.3) 1px, transparent 1px)
            `,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Simulate geographic features */}
          <div className="absolute top-8 left-12 w-20 h-12 bg-pathway-green/40 rounded-full opacity-60" />
          <div className="absolute bottom-12 right-16 w-24 h-16 bg-pathway-gold/40 rounded-lg opacity-60" />
          <div className="absolute top-16 right-12 w-16 h-8 bg-pathway-cream/60 rounded opacity-60" />
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-gray-200 rounded-full opacity-60" />

          {/* Project location marker (if available) */}
          {projectLatitude && projectLongitude && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-pathway-gold z-10">
              <div className="relative">
                <Target className="h-6 w-6" />
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs bg-white px-1 rounded border">
                  Project
                </span>
              </div>
            </div>
          )}

          {/* Selected location marker */}
          {selectedCoords && (
            <div
              className="absolute text-pathway-gold z-20 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${50 + ((selectedCoords.lng - (projectLongitude || 0)) / 0.01) * 50}%`,
                top: `${50 - ((selectedCoords.lat - (projectLatitude || 0)) / 0.01) * 50}%`,
              }}
            >
              <MapPin className="h-8 w-8 drop-shadow-lg" fill="currentColor" />
            </div>
          )}
        </div>

        {/* Instructions overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
          <div className="text-center bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-pathway-gold">
            <Globe className="h-8 w-8 mx-auto mb-2 text-pathway-green" />
            <p className="text-sm font-medium text-pathway-green">Click to select coordinates</p>
            <p className="text-xs text-pathway-green/70">Or enter manually below</p>
          </div>
        </div>

        {/* Coordinates display */}
        {selectedCoords && (
          <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm p-2 text-xs rounded border border-pathway-gold">
            <p className="font-medium text-pathway-green">Selected Location</p>
            <p className="font-mono text-pathway-green/70">
              {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
            </p>
          </div>
        )}
      </Card>

      {/* Manual coordinate input */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            placeholder="51.505"
            value={latitude}
            onChange={(e) => handleLatitudeChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            placeholder="-0.09"
            value={longitude}
            onChange={(e) => handleLongitudeChange(e.target.value)}
          />
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="flex gap-2">
        {projectLatitude && projectLongitude && (
          <Button variant="outline" size="sm" onClick={useProjectCoordinates}>
            <Target className="h-4 w-4 mr-2" />
            Use Project Location
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={getCurrentLocation}>
          <MapPin className="h-4 w-4 mr-2" />
          Use My Location
        </Button>
      </div>
    </div>
  )
}
