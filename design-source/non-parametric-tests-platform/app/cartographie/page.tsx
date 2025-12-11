"use client"

import { useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MapPin, Trash2, Info, Brain } from "lucide-react"
import { useData } from "@/contexts/data-context"
import Link from "next/link"

export default function CartographiePage() {
  const { predictionMarkers, clearMarkers } = useData()
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null)

  const getRiskColor = (risk: number) => {
    if (risk < 20) return "#22c55e" // green
    if (risk < 40) return "#eab308" // yellow
    if (risk < 60) return "#f97316" // orange
    if (risk < 80) return "#ef4444" // red
    return "#b91c1c" // dark red
  }

  const getRiskCategory = (risk: number) => {
    if (risk < 20) return "Faible"
    if (risk < 40) return "Modéré"
    if (risk < 60) return "Élevé"
    if (risk < 80) return "Très élevé"
    return "Critique"
  }

  // Calculate map bounds based on markers
  const getMapBounds = () => {
    if (predictionMarkers.length === 0) {
      return { minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 }
    }

    const lats = predictionMarkers.map((m) => m.latitude)
    const lngs = predictionMarkers.map((m) => m.longitude)

    const padding = 10
    return {
      minLat: Math.max(-90, Math.min(...lats) - padding),
      maxLat: Math.min(90, Math.max(...lats) + padding),
      minLng: Math.max(-180, Math.min(...lngs) - padding),
      maxLng: Math.min(180, Math.max(...lngs) + padding),
    }
  }

  const bounds = getMapBounds()

  const latToY = (lat: number, height: number) => {
    const range = bounds.maxLat - bounds.minLat
    return ((bounds.maxLat - lat) / range) * height
  }

  const lngToX = (lng: number, width: number) => {
    const range = bounds.maxLng - bounds.minLng
    return ((lng - bounds.minLng) / range) * width
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <MapPin className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Cartographie des Prédictions</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Visualisez les prédictions de risque de diabète sur une carte interactive.
          </p>
        </div>

        {predictionMarkers.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-6">
                <MapPin className="h-16 w-16 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-semibold text-foreground">Aucune prédiction enregistrée</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Effectuez une prédiction manuelle avec vos coordonnées géographiques pour voir les résultats sur la
                  carte.
                </p>
                <Link href="/prediction">
                  <Button size="lg">
                    <Brain className="mr-2 h-5 w-5" />
                    Faire une prédiction
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                {predictionMarkers.length} prédiction{predictionMarkers.length > 1 ? "s" : ""} enregistrée
                {predictionMarkers.length > 1 ? "s" : ""}
              </p>
              <Button variant="outline" onClick={clearMarkers}>
                <Trash2 className="mr-2 h-4 w-4" />
                Effacer tout
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Carte des risques de diabète</CardTitle>
                <CardDescription>Cliquez sur un marqueur pour voir les détails</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  ref={mapRef}
                  className="relative w-full h-[500px] bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg overflow-hidden border border-border"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "50px 50px",
                  }}
                >
                  {/* Map Grid Lines */}
                  <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
                    {/* Latitude lines */}
                    {[-60, -30, 0, 30, 60].map((lat) => {
                      const y = latToY(lat, 500)
                      if (y < 0 || y > 500) return null
                      return (
                        <g key={`lat-${lat}`}>
                          <line x1="0" y1={y} x2="100%" y2={y} stroke="rgba(0,0,0,0.1)" strokeDasharray="5,5" />
                          <text x="5" y={y - 5} fontSize="10" fill="rgba(0,0,0,0.4)">
                            {lat}°
                          </text>
                        </g>
                      )
                    })}
                    {/* Longitude lines */}
                    {[-120, -60, 0, 60, 120].map((lng) => {
                      const x = lngToX(lng, mapRef.current?.offsetWidth || 800)
                      if (x < 0 || x > (mapRef.current?.offsetWidth || 800)) return null
                      return (
                        <g key={`lng-${lng}`}>
                          <line x1={x} y1="0" x2={x} y2="100%" stroke="rgba(0,0,0,0.1)" strokeDasharray="5,5" />
                          <text x={x + 5} y="15" fontSize="10" fill="rgba(0,0,0,0.4)">
                            {lng}°
                          </text>
                        </g>
                      )
                    })}
                  </svg>

                  {/* Markers */}
                  {predictionMarkers.map((marker, index) => {
                    const x = lngToX(marker.longitude, mapRef.current?.offsetWidth || 800)
                    const y = latToY(marker.latitude, 500)

                    return (
                      <div
                        key={marker.id}
                        className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110"
                        style={{ left: `${(x / (mapRef.current?.offsetWidth || 800)) * 100}%`, top: y }}
                        onClick={() => setSelectedMarker(selectedMarker === index ? null : index)}
                      >
                        <div className="relative">
                          <svg width="32" height="40" viewBox="0 0 32 40">
                            <path
                              d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z"
                              fill={getRiskColor(marker.diabetesRisk)}
                              stroke="#fff"
                              strokeWidth="2"
                            />
                            <text x="16" y="20" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
                              {Math.round(marker.diabetesRisk)}
                            </text>
                          </svg>

                          {selectedMarker === index && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-lg p-4 z-10">
                              <div className="text-sm space-y-2">
                                <div className="font-bold text-lg" style={{ color: getRiskColor(marker.diabetesRisk) }}>
                                  Risque: {marker.diabetesRisk.toFixed(1)}% ({getRiskCategory(marker.diabetesRisk)})
                                </div>
                                <div className="border-t pt-2 space-y-1">
                                  <p>
                                    <strong>Âge:</strong> {marker.patientData.age} ans
                                  </p>
                                  <p>
                                    <strong>IMC:</strong> {marker.patientData.bmi} kg/m²
                                  </p>
                                  <p>
                                    <strong>Glucose:</strong> {marker.patientData.glucose} mg/dL
                                  </p>
                                  <p>
                                    <strong>Pression:</strong> {marker.patientData.bloodPressure} mmHg
                                  </p>
                                  <p>
                                    <strong>Insuline:</strong> {marker.patientData.insulin} μU/mL
                                  </p>
                                </div>
                                <div className="border-t pt-2 text-xs text-muted-foreground">
                                  <p>
                                    Lat: {marker.latitude.toFixed(4)}, Lng: {marker.longitude.toFixed(4)}
                                  </p>
                                  <p>Date: {new Date(marker.timestamp).toLocaleString("fr-FR")}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle>Légende</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  {[
                    { range: "0-19%", label: "Faible", color: "#22c55e" },
                    { range: "20-39%", label: "Modéré", color: "#eab308" },
                    { range: "40-59%", label: "Élevé", color: "#f97316" },
                    { range: "60-79%", label: "Très élevé", color: "#ef4444" },
                    { range: "80-100%", label: "Critique", color: "#b91c1c" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">
                        {item.label} ({item.range})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Markers List */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des prédictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictionMarkers.map((marker, index) => (
                    <div
                      key={marker.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedMarker(index)}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: getRiskColor(marker.diabetesRisk) }}
                        >
                          {Math.round(marker.diabetesRisk)}%
                        </div>
                        <div>
                          <p className="font-medium">Risque {getRiskCategory(marker.diabetesRisk)}</p>
                          <p className="text-sm text-muted-foreground">
                            Lat: {marker.latitude.toFixed(4)}, Lng: {marker.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(marker.timestamp).toLocaleString("fr-FR")}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Comment utiliser la cartographie</AlertTitle>
          <AlertDescription>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Allez sur la page "Prédiction" pour entrer vos données de santé</li>
              <li>Ajoutez vos coordonnées géographiques (latitude et longitude)</li>
              <li>Après le calcul, cliquez sur "Voir sur la cartographie"</li>
              <li>Visualisez vos résultats avec un marqueur coloré selon le niveau de risque</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
