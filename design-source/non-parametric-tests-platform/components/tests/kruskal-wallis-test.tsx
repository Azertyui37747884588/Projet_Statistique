"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calculator, Info, Plus, X } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { VariableSelector } from "@/components/variable-selector"

export function KruskalWallisTest() {
  const { data } = useData()
  const [selectedGroups, setSelectedGroups] = useState<string[]>(["", "", ""])
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const addGroup = () => {
    setSelectedGroups([...selectedGroups, ""])
  }

  const removeGroup = (index: number) => {
    if (selectedGroups.length > 2) {
      setSelectedGroups(selectedGroups.filter((_, i) => i !== index))
    }
  }

  const updateGroup = (index: number, value: string) => {
    const newGroups = [...selectedGroups]
    newGroups[index] = value
    setSelectedGroups(newGroups)
  }

  const calculateKruskalWallis = () => {
    setError("")
    setResult(null)

    try {
      const parsedGroups = selectedGroups
        .filter((varName) => varName !== "")
        .map((varName) => {
          const values = data
            .map((row) => {
              const val = row[varName]
              if (val === null || val === undefined || val === "") return Number.NaN
              return Number.parseFloat(val)
            })
            .filter((v) => !isNaN(v) && isFinite(v))

          return values
        })
        .filter((g) => g.length >= 2) // Each group must have at least 2 values

      if (parsedGroups.length < 2) {
        setError(
          "Impossible d'exécuter le test : il faut au moins deux groupes valides avec au moins 2 valeurs numériques chacun.",
        )
        return
      }

      const groupSizes = parsedGroups.map((g) => g.length)
      if (groupSizes.some((size) => size < 2)) {
        setError("Chaque groupe doit contenir au moins 2 valeurs valides.")
        return
      }

      const allData: { value: number; group: number }[] = []
      parsedGroups.forEach((group, groupIndex) => {
        group.forEach((value) => {
          allData.push({ value, group: groupIndex })
        })
      })

      allData.sort((a, b) => a.value - b.value)

      const ranks = allData.map((_, i) => {
        const sameValues = allData.filter((d) => d.value === allData[i].value)
        const startRank = allData.findIndex((d) => d.value === allData[i].value) + 1
        const endRank = startRank + sameValues.length - 1
        return (startRank + endRank) / 2
      })

      const rankSums = parsedGroups.map((_, groupIndex) => {
        return ranks.filter((_, i) => allData[i].group === groupIndex).reduce((a, b) => a + b, 0)
      })

      const N = allData.length
      const k = parsedGroups.length

      let H = 0
      parsedGroups.forEach((group, i) => {
        const ni = group.length
        const Ri = rankSums[i]
        H += (Ri * Ri) / ni
      })
      H = (12 / (N * (N + 1))) * H - 3 * (N + 1)

      const df = k - 1
      const pValue = 1 - chiSquareCDF(H, df)

      setResult({
        statistic: H.toFixed(4),
        pValue: pValue.toFixed(4),
        df: df,
        groups: parsedGroups.length,
        totalN: N,
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
              <CardTitle className="text-lg">Test de Kruskal-Wallis</CardTitle>
              <CardDescription className="mt-2">
                Le test de Kruskal-Wallis compare trois groupes indépendants ou plus. C'est l'alternative non
                paramétrique à l'ANOVA à un facteur.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sélectionnez vos variables</CardTitle>
          <CardDescription>Choisissez les colonnes à comparer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedGroups.map((group, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <VariableSelector
                  label={`Groupe ${index + 1}`}
                  value={group}
                  onChange={(value) => updateGroup(index, value)}
                />
              </div>
              {selectedGroups.length > 2 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="mt-8 bg-transparent"
                  onClick={() => removeGroup(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button variant="outline" onClick={addGroup} className="w-full bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un groupe
          </Button>

          <Button onClick={calculateKruskalWallis} className="w-full">
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
                <p className="text-sm text-muted-foreground">Statistique H</p>
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
                <p>Nombre de groupes: {result.groups}</p>
                <p>Taille totale: {result.totalN}</p>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {result.interpretation === "significatif"
                  ? "Il existe une différence significative entre au moins deux groupes (p < 0.05)."
                  : "Il n'y a pas de différence significative entre les groupes (p ≥ 0.05)."}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
