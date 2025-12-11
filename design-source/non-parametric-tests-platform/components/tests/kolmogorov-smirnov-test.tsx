"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calculator, Info } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { VariableSelector } from "@/components/variable-selector"

export function KolmogorovSmirnovTest() {
  const { data } = useData()
  const [sample1Variable, setSample1Variable] = useState("")
  const [sample2Variable, setSample2Variable] = useState("")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const calculateKS = () => {
    setError("")
    setResult(null)

    try {
      const data1 = data
        .map((row) => {
          const val = row[sample1Variable]
          if (val === null || val === undefined || val === "") return Number.NaN
          const num = typeof val === "number" ? val : Number.parseFloat(String(val))
          return num
        })
        .filter((v) => !isNaN(v) && isFinite(v))
        .sort((a, b) => a - b)

      const data2 = data
        .map((row) => {
          const val = row[sample2Variable]
          if (val === null || val === undefined || val === "") return Number.NaN
          const num = typeof val === "number" ? val : Number.parseFloat(String(val))
          return num
        })
        .filter((v) => !isNaN(v) && isFinite(v))
        .sort((a, b) => a - b)

      if (data1.length < 2 || data2.length < 2) {
        setError("Impossible d'exécuter le test : chaque échantillon doit contenir au moins 2 valeurs valides.")
        return
      }

      const n1 = data1.length
      const n2 = data2.length

      let maxD = 0
      const allValues = [...new Set([...data1, ...data2])].sort((a, b) => a - b)

      allValues.forEach((value) => {
        const cdf1 = data1.filter((v) => v <= value).length / n1
        const cdf2 = data2.filter((v) => v <= value).length / n2
        const diff = Math.abs(cdf1 - cdf2)
        if (diff > maxD) maxD = diff
      })

      const n = (n1 * n2) / (n1 + n2)
      const lambda = maxD * Math.sqrt(n)
      const pValue = 2 * Math.exp(-2 * lambda * lambda)

      setResult({
        statistic: maxD.toFixed(4),
        pValue: Math.min(1, pValue).toFixed(4),
        n1: n1,
        n2: n2,
        interpretation: pValue < 0.05 ? "significatif" : "non significatif",
      })
    } catch (err) {
      setError("Erreur lors du calcul. Vérifiez que vos données sont numériques et complètes.")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-muted/50">
        <CardHeader>
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <CardTitle className="text-lg">Test de Kolmogorov-Smirnov</CardTitle>
              <CardDescription className="mt-2">
                Le test de Kolmogorov-Smirnov compare les distributions de deux échantillons indépendants. Il teste si
                les deux échantillons proviennent de la même distribution.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sélectionnez vos variables</CardTitle>
          <CardDescription>Choisissez deux colonnes à comparer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <VariableSelector label="Échantillon 1" value={sample1Variable} onChange={setSample1Variable} />

          <VariableSelector label="Échantillon 2" value={sample2Variable} onChange={setSample2Variable} />

          <Button onClick={calculateKS} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
            Calculer le test
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Résultats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Statistique D</p>
                <p className="text-2xl font-bold">{result.statistic}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valeur p</p>
                <p className="text-2xl font-bold">{result.pValue}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Taille échantillon 1</p>
                <p className="text-2xl font-bold">{result.n1}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Taille échantillon 2</p>
                <p className="text-2xl font-bold">{result.n2}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Badge variant={result.interpretation === "significatif" ? "default" : "secondary"} className="text-base">
                {result.interpretation}
              </Badge>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {result.interpretation === "significatif"
                  ? "Les deux échantillons proviennent de distributions significativement différentes (p < 0.05)."
                  : "Les deux échantillons pourraient provenir de la même distribution (p ≥ 0.05)."}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
