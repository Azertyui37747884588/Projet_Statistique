"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LineChart, BarChart3, ScatterChart, Info, AlertTriangle } from "lucide-react"
import { BoxPlotChart } from "@/components/charts/box-plot-chart"
import { HistogramChart } from "@/components/charts/histogram-chart"
import { ScatterPlotChart } from "@/components/charts/scatter-plot-chart"
import { LineChartViz } from "@/components/charts/line-chart-viz"
import { useData } from "@/contexts/data-context"
import { VariableSelector } from "@/components/variable-selector"
import { isNumeric, countValidPairs, getValidPairSamples } from "@/lib/data-utils"

export default function VisualisationPage() {
  const { data } = useData()
  const [variable1, setVariable1] = useState("")
  const [variable2, setVariable2] = useState("")
  const [parsedData, setParsedData] = useState<number[]>([])
  const [parsedData2, setParsedData2] = useState<number[]>([])
  const [error, setError] = useState("")

  const validPairCount = variable1 && variable2 ? countValidPairs(data, variable1, variable2) : 0
  const validPairSamples = variable1 && variable2 ? getValidPairSamples(data, variable1, variable2, 5) : []
  const needsPairValidation = variable2.trim() !== ""
  const canGenerate = variable1 && (!needsPairValidation || validPairCount >= 2)

  const handleDataParse = () => {
    setError("")
    try {
      const colIndex1 = Number.parseInt(variable1)
      if (isNaN(colIndex1) || !data || data.length === 0) {
        setError("Veuillez sélectionner une variable valide.")
        return
      }

      const values = data
        .map((row) => {
          const value = Array.isArray(row) ? row[colIndex1] : row[Object.keys(row)[colIndex1]]
          return isNumeric(value) ? Number(value) : null
        })
        .filter((v) => v !== null) as number[]

      if (values.length === 0) {
        setError("Aucune donnée numérique valide trouvée dans la variable sélectionnée.")
        return
      }

      setParsedData(values)

      // Parse second dataset if provided
      if (variable2.trim()) {
        const colIndex2 = Number.parseInt(variable2)
        if (!isNaN(colIndex2)) {
          const validPairs = countValidPairs(data, variable1, variable2)
          console.log(`[v0] Valid pairs found: ${validPairs}`)

          const values2 = data
            .map((row) => {
              const value = Array.isArray(row) ? row[colIndex2] : row[Object.keys(row)[colIndex2]]
              return isNumeric(value) ? Number(value) : null
            })
            .filter((v) => v !== null) as number[]

          if (values2.length === 0) {
            setError("Aucune donnée numérique valide trouvée dans la deuxième variable.")
            return
          }

          setParsedData2(values2)
        } else {
          setParsedData2([])
        }
      } else {
        setParsedData2([])
      }
    } catch (err) {
      console.error("[v0] Error parsing data:", err)
      setError("Erreur lors de l'analyse des données. Vérifiez que les colonnes contiennent des valeurs numériques.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Visualisation des données</h1>
          <p className="text-muted-foreground">
            Créez des graphiques interactifs pour explorer et comprendre vos données.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sélectionnez vos variables</CardTitle>
            <CardDescription>Choisissez les colonnes à visualiser</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <VariableSelector label="Variable principale (série 1)" value={variable1} onChange={setVariable1} />

            <VariableSelector label="Variable optionnelle (série 2)" value={variable2} onChange={setVariable2} />

            {needsPairValidation && variable1 && variable2 && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">
                  Nombre de paires valides: <span className="text-primary font-bold">{validPairCount}</span>
                </p>

                {validPairCount < 2 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Il faut au moins 2 paires valides pour générer des visualisations avec deux variables.
                    </AlertDescription>
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

            <Button onClick={handleDataParse} className="w-full" disabled={!canGenerate}>
              Générer les visualisations
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {parsedData.length > 0 && (
          <Tabs defaultValue="boxplot" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="boxplot">
                <BarChart3 className="h-4 w-4 mr-2" />
                Boîte à moustaches
              </TabsTrigger>
              <TabsTrigger value="histogram">
                <BarChart3 className="h-4 w-4 mr-2" />
                Histogramme
              </TabsTrigger>
              <TabsTrigger value="line">
                <LineChart className="h-4 w-4 mr-2" />
                Courbe
              </TabsTrigger>
              <TabsTrigger value="scatter">
                <ScatterChart className="h-4 w-4 mr-2" />
                Nuage de points
              </TabsTrigger>
            </TabsList>

            <TabsContent value="boxplot" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Diagramme en boîte à moustaches</CardTitle>
                  <CardDescription>
                    Visualise la distribution des données avec les quartiles, la médiane et les valeurs aberrantes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BoxPlotChart data={parsedData} data2={parsedData2.length > 0 ? parsedData2 : undefined} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="histogram" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Histogramme</CardTitle>
                  <CardDescription>Montre la distribution de fréquence des données par intervalles.</CardDescription>
                </CardHeader>
                <CardContent>
                  <HistogramChart data={parsedData} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="line" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Graphique en courbe</CardTitle>
                  <CardDescription>Affiche l'évolution des valeurs dans l'ordre de saisie.</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChartViz data={parsedData} data2={parsedData2.length > 0 ? parsedData2 : undefined} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scatter" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nuage de points</CardTitle>
                  <CardDescription>
                    {parsedData2.length > 0
                      ? "Visualise la relation entre deux variables."
                      : "Affiche les valeurs en fonction de leur index."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScatterPlotChart data={parsedData} data2={parsedData2.length > 0 ? parsedData2 : undefined} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {parsedData.length > 0 && (
          <Card className="bg-muted/50">
            <CardHeader>
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <CardTitle className="text-lg">Statistiques descriptives</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Moyenne</p>
                  <p className="text-xl font-bold">
                    {(parsedData.reduce((a, b) => a + b, 0) / parsedData.length).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Médiane</p>
                  <p className="text-xl font-bold">
                    {(() => {
                      const sorted = [...parsedData].sort((a, b) => a - b)
                      const mid = Math.floor(sorted.length / 2)
                      return sorted.length % 2 === 0
                        ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2)
                        : sorted[mid].toFixed(2)
                    })()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Min</p>
                  <p className="text-xl font-bold">{Math.min(...parsedData).toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Max</p>
                  <p className="text-xl font-bold">{Math.max(...parsedData).toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Écart-type</p>
                  <p className="text-xl font-bold">
                    {(() => {
                      const mean = parsedData.reduce((a, b) => a + b, 0) / parsedData.length
                      const variance =
                        parsedData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / parsedData.length
                      return Math.sqrt(variance).toFixed(2)
                    })()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Variance</p>
                  <p className="text-xl font-bold">
                    {(() => {
                      const mean = parsedData.reduce((a, b) => a + b, 0) / parsedData.length
                      return (
                        parsedData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / parsedData.length
                      ).toFixed(2)
                    })()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Q1</p>
                  <p className="text-xl font-bold">
                    {(() => {
                      const sorted = [...parsedData].sort((a, b) => a - b)
                      const q1Index = Math.floor(sorted.length * 0.25)
                      return sorted[q1Index].toFixed(2)
                    })()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Q3</p>
                  <p className="text-xl font-bold">
                    {(() => {
                      const sorted = [...parsedData].sort((a, b) => a - b)
                      const q3Index = Math.floor(sorted.length * 0.75)
                      return sorted[q3Index].toFixed(2)
                    })()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
