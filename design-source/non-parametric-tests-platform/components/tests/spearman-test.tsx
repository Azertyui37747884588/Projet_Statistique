"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calculator, Info, AlertTriangle } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { VariableSelector } from "@/components/variable-selector"
import { isNumeric, countValidPairs, getValidPairSamples } from "@/lib/data-utils"

export function SpearmanTest() {
  const { data } = useData()
  const [xVariable, setXVariable] = useState("")
  const [yVariable, setYVariable] = useState("")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const validPairCount = xVariable && yVariable ? countValidPairs(data, xVariable, yVariable) : 0
  const validPairSamples = xVariable && yVariable ? getValidPairSamples(data, xVariable, yVariable, 5) : []
  const canRunTest = validPairCount >= 2

  const calculateSpearman = () => {
    setError("")
    setResult(null)

    try {
      const validPairCount = countValidPairs(data, xVariable, yVariable)

      if (validPairCount < 2) {
        setError(`Il faut au moins 2 paires de valeurs valides. Trouvé: ${validPairCount} paire(s) valide(s).`)
        return
      }

      const cleanedData = data
        .map((row) => {
          const valX = row[xVariable]
          const valY = row[yVariable]

          if (!isNumeric(valX) || !isNumeric(valY)) {
            return null
          }

          return { x: Number(valX), y: Number(valY) }
        })
        .filter((pair) => pair !== null) as { x: number; y: number }[]

      const x = cleanedData.map((p) => p.x)
      const y = cleanedData.map((p) => p.y)
      const n = x.length

      const rankX = getRanks(x)
      const rankY = getRanks(y)

      const d2 = rankX.map((rx, i) => Math.pow(rx - rankY[i], 2))
      const sumD2 = d2.reduce((a, b) => a + b, 0)

      const rho = 1 - (6 * sumD2) / (n * (n * n - 1))

      const t = (rho * Math.sqrt(n - 2)) / Math.sqrt(1 - rho * rho)
      const pValue = 2 * (1 - tDistributionCDF(Math.abs(t), n - 2))

      setResult({
        rho: rho.toFixed(4),
        pValue: pValue.toFixed(4),
        n: n,
        interpretation: pValue < 0.05 ? "significatif" : "non significatif",
        correlation: Math.abs(rho) > 0.7 ? "forte" : Math.abs(rho) > 0.4 ? "modérée" : "faible",
        direction: rho > 0 ? "positive" : "négative",
      })
    } catch (err) {
      setError("Erreur lors du calcul. Vérifiez que vos données sont numériques et complètes.")
    }
  }

  const getRanks = (data: number[]) => {
    const sorted = data.map((v, i) => ({ value: v, index: i })).sort((a, b) => a.value - b.value)

    const ranks = new Array(data.length)
    sorted.forEach((item, i) => {
      const sameValues = sorted.filter((s) => s.value === item.value)
      const avgRank =
        (sameValues.reduce((sum, s) => sum + sorted.indexOf(s), 0) + sameValues.length) / sameValues.length + 1
      ranks[item.index] = avgRank
    })

    return ranks
  }

  const tDistributionCDF = (t: number, df: number) => {
    if (df > 30) {
      return normalCDF(t)
    }
    const x = df / (df + t * t)
    return 1 - 0.5 * Math.pow(x, df / 2)
  }

  const normalCDF = (x: number) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(x))
    const d = 0.3989423 * Math.exp((-x * x) / 2)
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
    return x > 0 ? 1 - prob : prob
  }

  return (
    <div className="space-y-6">
      <Card className="bg-muted/50">
        <CardHeader>
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <CardTitle className="text-lg">Test de corrélation de Spearman</CardTitle>
              <CardDescription className="mt-2">
                Le test de Spearman mesure la corrélation monotone entre deux variables. Il évalue si deux variables
                tendent à augmenter ou diminuer ensemble, sans supposer une relation linéaire.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sélectionnez vos variables</CardTitle>
          <CardDescription>Choisissez deux colonnes à corréler</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <VariableSelector label="Variable X" value={xVariable} onChange={setXVariable} />

          <VariableSelector label="Variable Y" value={yVariable} onChange={setYVariable} />

          {xVariable && yVariable && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">
                Nombre de paires valides: <span className="text-primary font-bold">{validPairCount}</span>
              </p>

              {!canRunTest && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Il faut au moins 2 paires valides pour exécuter le test.</AlertDescription>
                </Alert>
              )}

              {validPairSamples.length > 0 && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Voir échantillon de paires valides ({validPairSamples.length})
                  </summary>
                  <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto">
                    {JSON.stringify(validPairSamples, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}

          <Button onClick={calculateSpearman} className="w-full" disabled={!canRunTest}>
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
                <p className="text-sm text-muted-foreground">Coefficient ρ (rho)</p>
                <p className="text-2xl font-bold">{result.rho}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valeur p</p>
                <p className="text-2xl font-bold">{result.pValue}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Taille échantillon</p>
                <p className="text-2xl font-bold">{result.n}</p>
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
                <p>Force de corrélation: {result.correlation}</p>
                <p>Direction: {result.direction}</p>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {result.interpretation === "significatif"
                  ? `Il existe une corrélation ${result.correlation} ${result.direction} significative entre les deux variables (p < 0.05).`
                  : "Il n'y a pas de corrélation significative entre les deux variables (p ≥ 0.05)."}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
