"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Brain, MapPin, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function PredictionPage() {
  const router = useRouter()
  const { addPredictionMarker } = useData()

  const [formData, setFormData] = useState({
    age: "",
    bmi: "",
    glucose: "",
    bloodPressure: "",
    insulin: "",
    latitude: "",
    longitude: "",
  })

  const [result, setResult] = useState<{
    risk: number
    category: string
    message: string
  } | null>(null)

  const [isCalculating, setIsCalculating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      newErrors.age = "Âge invalide"
    }
    if (!formData.bmi || isNaN(Number(formData.bmi)) || Number(formData.bmi) <= 0) {
      newErrors.bmi = "IMC invalide"
    }
    if (!formData.glucose || isNaN(Number(formData.glucose)) || Number(formData.glucose) <= 0) {
      newErrors.glucose = "Glucose invalide"
    }
    if (!formData.bloodPressure || isNaN(Number(formData.bloodPressure)) || Number(formData.bloodPressure) <= 0) {
      newErrors.bloodPressure = "Pression artérielle invalide"
    }
    if (!formData.insulin || isNaN(Number(formData.insulin)) || Number(formData.insulin) < 0) {
      newErrors.insulin = "Insuline invalide"
    }
    if (!formData.latitude || isNaN(Number(formData.latitude)) || Math.abs(Number(formData.latitude)) > 90) {
      newErrors.latitude = "Latitude invalide (-90 à 90)"
    }
    if (!formData.longitude || isNaN(Number(formData.longitude)) || Math.abs(Number(formData.longitude)) > 180) {
      newErrors.longitude = "Longitude invalide (-180 à 180)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateDiabetesRisk = () => {
    if (!validateForm()) return

    setIsCalculating(true)

    setTimeout(() => {
      const age = Number(formData.age)
      const bmi = Number(formData.bmi)
      const glucose = Number(formData.glucose)
      const bloodPressure = Number(formData.bloodPressure)
      const insulin = Number(formData.insulin)

      // Algorithme simplifié de calcul du risque de diabète
      let riskScore = 0

      // Facteur âge (risque augmente avec l'âge)
      if (age >= 45) riskScore += 15
      else if (age >= 35) riskScore += 10
      else if (age >= 25) riskScore += 5

      // Facteur IMC
      if (bmi >= 35) riskScore += 25
      else if (bmi >= 30) riskScore += 20
      else if (bmi >= 25) riskScore += 10
      else if (bmi >= 18.5) riskScore += 0
      else riskScore += 5 // sous-poids

      // Facteur glucose (mg/dL)
      if (glucose >= 200) riskScore += 30
      else if (glucose >= 140) riskScore += 20
      else if (glucose >= 100) riskScore += 10

      // Facteur pression artérielle
      if (bloodPressure >= 140) riskScore += 15
      else if (bloodPressure >= 130) riskScore += 10
      else if (bloodPressure >= 120) riskScore += 5

      // Facteur insuline
      if (insulin > 200) riskScore += 15
      else if (insulin > 100) riskScore += 10
      else if (insulin > 50) riskScore += 5

      // Normaliser le score entre 0 et 100
      const normalizedRisk = Math.min(100, Math.max(0, riskScore))

      let category: string
      let message: string

      if (normalizedRisk < 20) {
        category = "Faible"
        message = "Votre risque de diabète est faible. Continuez à maintenir un mode de vie sain."
      } else if (normalizedRisk < 40) {
        category = "Modéré"
        message =
          "Votre risque de diabète est modéré. Surveillez votre alimentation et faites de l'exercice régulièrement."
      } else if (normalizedRisk < 60) {
        category = "Élevé"
        message = "Votre risque de diabète est élevé. Consultez un médecin pour un dépistage approfondi."
      } else if (normalizedRisk < 80) {
        category = "Très élevé"
        message = "Votre risque de diabète est très élevé. Une consultation médicale urgente est recommandée."
      } else {
        category = "Critique"
        message = "Votre risque de diabète est critique. Veuillez consulter un professionnel de santé immédiatement."
      }

      setResult({ risk: normalizedRisk, category, message })
      setIsCalculating(false)
    }, 1000)
  }

  const handleAddToMap = () => {
    if (!result) return

    addPredictionMarker({
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      diabetesRisk: result.risk,
      patientData: {
        age: Number(formData.age),
        bmi: Number(formData.bmi),
        glucose: Number(formData.glucose),
        bloodPressure: Number(formData.bloodPressure),
        insulin: Number(formData.insulin),
      },
    })

    // Rediriger vers la cartographie
    router.push("/cartographie")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk < 20) return "text-green-600"
    if (risk < 40) return "text-yellow-600"
    if (risk < 60) return "text-orange-500"
    if (risk < 80) return "text-red-500"
    return "text-red-700"
  }

  const getRiskBgColor = (risk: number) => {
    if (risk < 20) return "bg-green-100 border-green-300"
    if (risk < 40) return "bg-yellow-100 border-yellow-300"
    if (risk < 60) return "bg-orange-100 border-orange-300"
    if (risk < 80) return "bg-red-100 border-red-300"
    return "bg-red-200 border-red-400"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Prédiction Manuelle</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Entrez vos paramètres de santé pour estimer votre risque de diabète et visualisez-le sur la carte.
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Information importante</AlertTitle>
          <AlertDescription>
            Cette prédiction est basée sur un modèle simplifié et ne remplace pas un diagnostic médical professionnel.
            Consultez toujours un médecin pour un avis médical qualifié.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de santé</CardTitle>
              <CardDescription>Entrez vos données médicales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">Âge (années)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Ex: 45"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className={errors.age ? "border-red-500" : ""}
                />
                {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bmi">IMC (kg/m²)</Label>
                <Input
                  id="bmi"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 25.5"
                  value={formData.bmi}
                  onChange={(e) => handleInputChange("bmi", e.target.value)}
                  className={errors.bmi ? "border-red-500" : ""}
                />
                {errors.bmi && <p className="text-sm text-red-500">{errors.bmi}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="glucose">Glucose (mg/dL)</Label>
                <Input
                  id="glucose"
                  type="number"
                  placeholder="Ex: 100"
                  value={formData.glucose}
                  onChange={(e) => handleInputChange("glucose", e.target.value)}
                  className={errors.glucose ? "border-red-500" : ""}
                />
                {errors.glucose && <p className="text-sm text-red-500">{errors.glucose}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodPressure">Pression artérielle systolique (mmHg)</Label>
                <Input
                  id="bloodPressure"
                  type="number"
                  placeholder="Ex: 120"
                  value={formData.bloodPressure}
                  onChange={(e) => handleInputChange("bloodPressure", e.target.value)}
                  className={errors.bloodPressure ? "border-red-500" : ""}
                />
                {errors.bloodPressure && <p className="text-sm text-red-500">{errors.bloodPressure}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="insulin">Insuline (μU/mL)</Label>
                <Input
                  id="insulin"
                  type="number"
                  placeholder="Ex: 80"
                  value={formData.insulin}
                  onChange={(e) => handleInputChange("insulin", e.target.value)}
                  className={errors.insulin ? "border-red-500" : ""}
                />
                {errors.insulin && <p className="text-sm text-red-500">{errors.insulin}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localisation géographique
              </CardTitle>
              <CardDescription>Entrez vos coordonnées pour afficher votre prédiction sur la carte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  placeholder="Ex: 48.8566 (Paris)"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                  className={errors.latitude ? "border-red-500" : ""}
                />
                {errors.latitude && <p className="text-sm text-red-500">{errors.latitude}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  placeholder="Ex: 2.3522 (Paris)"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                  className={errors.longitude ? "border-red-500" : ""}
                />
                {errors.longitude && <p className="text-sm text-red-500">{errors.longitude}</p>}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Astuce :</strong> Vous pouvez trouver vos coordonnées sur Google Maps en cliquant droit sur un
                  emplacement et en copiant les coordonnées.
                </p>
              </div>

              <Button onClick={calculateDiabetesRisk} className="w-full" disabled={isCalculating}>
                {isCalculating ? "Calcul en cours..." : "Calculer le risque de diabète"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {result && (
          <Card className={`${getRiskBgColor(result.risk)} border-2`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.risk < 40 ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                )}
                Résultat de la prédiction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getRiskColor(result.risk)}`}>{result.risk.toFixed(1)}%</div>
                <div className={`text-2xl font-semibold mt-2 ${getRiskColor(result.risk)}`}>
                  Risque {result.category}
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    result.risk < 20
                      ? "bg-green-500"
                      : result.risk < 40
                        ? "bg-yellow-500"
                        : result.risk < 60
                          ? "bg-orange-500"
                          : result.risk < 80
                            ? "bg-red-500"
                            : "bg-red-700"
                  }`}
                  style={{ width: `${result.risk}%` }}
                />
              </div>

              <p className="text-center text-lg">{result.message}</p>

              <Button onClick={handleAddToMap} className="w-full" size="lg">
                <MapPin className="mr-2 h-5 w-5" />
                Voir sur la cartographie
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
