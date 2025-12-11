"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calculator, Info, Plus, X } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { VariableSelector } from "@/components/variable-selector"

export function FriedmanTest() {
  const { data } = useData()
  const [selectedConditions, setSelectedConditions] = useState<string[]>(["", "", ""])
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const addCondition = () => {
    setSelectedConditions([...selectedConditions, ""])
  }

  const removeCondition = (index: number) => {
    if (selectedConditions.length > 2) {
      setSelectedConditions(selectedConditions.filter((_, i) => i !== index))
    }
  }

  const updateCondition = (index: number, value: string) => {
    const newConditions = [...selectedConditions]
    newConditions[index] = value
    setSelectedConditions(newConditions)
  }

  const calculateFriedman = () => {
    setError("")
    setResult(null)

    try {
      const validConditions = selectedConditions.filter((v) => v !== "")

      if (validConditions.length < 2) {
        setError("Veuillez sélectionner au moins 2 conditions.")
        return
      }

      const rows = data
        .map((row) => {
          return validConditions.map((varName) => {
            const val = row[varName]
            if (val === null || val === undefined || val === "") return Number.NaN
            return Number.parseFloat(val)
          })
        })
        .filter((row) => {
          return row.every((v) => !isNaN(v) && isFinite(v))
        })

      if (rows.length < 2) {
        setError(
          "Impossible d'exécuter le test : il faut au moins 2 sujets avec des valeurs valides pour toutes les conditions.",
        )
        return
      }

      const k = validConditions.length
      const n = rows.length

      const rankedRows = rows.map((row) => {
        const indexed = row.map((value, i) => ({ value, index: i }))
        indexed.sort((a, b) => a.value - b.value)

        const ranks = new Array(k)
        indexed.forEach((item, i) => {
          const sameValues = indexed.filter((x) => x.value === item.value)
          const avgRank =
            (sameValues.reduce((sum, x) => sum + indexed.indexOf(x), 0) + sameValues.length) / sameValues.length + 1
          ranks[item.index] = avgRank
        })
        return ranks
      })

      const rankSums = new Array(k).fill(0)
      rankedRows.forEach((ranks) => {
        ranks.forEach((rank, i) => {
          rankSums[i] += rank
        })
      })

      const sumSquares = rankSums.reduce((sum, R) => sum + R * R, 0)
      const Q = (12 / (n * k * (k + 1))) * sumSquares - 3 * n * (k + 1)

      const df = k - 1
      const pValue = 1 - chiSquareCDF(Q, df)

      setResult({
        statistic: Q.toFixed(4),
        pValue: pValue.toFixed(4),
        df: df,
        subjects: n,
        conditions: k,
        interpretation: pValue < 0.05 ? "significatif" : "non significatif",
      })
    } catch (err) {
      setError("Erreur lors du calcul. Vérifiez que vos données sont numériques et complètes.")
    }
  }

  const chiSquareCDF = (x: number, df: number) => {
    if (x <= 0) return 0
    const k = df / 2
    const lambda = x / 2
    let sum = 0
    let term = Math.exp(-lambda)
    sum += term

    for (let i = 1; i < 50; i++) {
      term *= lambda / (k + i - 1)
      sum += term
      if (term < 1e-10) break
    }

    return Math.min(1, sum)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-muted/50">
        <CardHeader>
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <CardTitle className="text-lg">Test de Friedman</CardTitle>
              <CardDescription className="mt-2">
                Le test de Friedman compare trois conditions répétées ou plus. C'est l'alternative non paramétrique à
                l'ANOVA à mesures répétées. Chaque ligne de données représente un sujet, chaque variable sélectionnée
                une condition.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sélectionnez vos conditions</CardTitle>
          <CardDescription>Choisissez les colonnes représentant les différentes conditions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedConditions.map((condition, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <VariableSelector
                  label={`Condition ${index + 1}`}
                  value={condition}
                  onChange={(value) => updateCondition(index, value)}
                />
              </div>
              {selectedConditions.length > 2 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="mt-8 bg-transparent"
                  onClick={() => removeCondition(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button variant="outline" onClick={addCondition} className="w-full bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une condition
          </Button>

          <Button onClick={calculateFriedman} className="w-full">
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
                <p className="text-sm text-muted-foreground">Statistique Q</p>
                <p className="text-2xl font-bold">{result.statistic}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valeur p</p>
                <p className="text-2xl font-bold">{result.pValue}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Degrés de liberté</p>
                <p className="text-2xl font-bold">{result.df}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Interprétation</p>
                <Badge variant={result.interpretation === "significatif" ? "default" : "secondary"}>
                  {result.interpretation}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Détails:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Nombre de sujets: {result.subjects}</p>
                <p>Nombre de conditions: {result.conditions}</p>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {result.interpretation === "significatif"
                  ? "Il existe une différence significative entre au moins deux conditions (p < 0.05)."
                  : "Il n'y a pas de différence significative entre les conditions (p ≥ 0.05)."}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
