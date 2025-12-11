"use client"

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface ScatterPlotChartProps {
  data: number[]
  data2?: number[]
}

export function ScatterPlotChart({ data, data2 }: ScatterPlotChartProps) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">Aucune donnée à afficher</div>
    )
  }

  try {
    const chartData =
      data2 && Array.isArray(data2) && data2.length > 0
        ? data
            .map((y, i) => ({
              x: data2[i] !== undefined && data2[i] !== null ? data2[i] : null,
              y: y !== undefined && y !== null ? y : null,
            }))
            .filter((point) => point.x !== null && point.y !== null)
        : data
            .filter((y) => y !== null && y !== undefined)
            .map((y, i) => ({
              x: i + 1,
              y: y,
            }))

    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
          Aucune donnée valide à afficher
        </div>
      )
    }

    const handleScatterClick = (e: any) => {
      try {
        // Recharts onClick guard - check if event and activePayload exist
        if (!e || !e?.activePayload || !Array.isArray(e.activePayload) || e.activePayload.length === 0) return
        const payload = e.activePayload[0]?.payload
        if (!payload) return
        console.log("[v0] Scatter point clicked:", payload)
      } catch (err) {
        console.error("[v0] Scatter click error:", err)
      }
    }

    return (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }} onClick={handleScatterClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              dataKey="x"
              name={data2 && data2.length > 0 ? "Série 2" : "Index"}
              label={{
                value: data2 && data2.length > 0 ? "Série 2" : "Index",
                position: "insideBottom",
                offset: -5,
              }}
              stroke="hsl(var(--foreground))"
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Série 1"
              label={{ value: "Série 1", angle: -90, position: "insideLeft" }}
              stroke="hsl(var(--foreground))"
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Scatter name="Points" data={chartData} fill="hsl(var(--chart-1))" shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Nombre de points: {chartData.length}</p>
          {data2 && data2.length > 0 && chartData.length > 1 && (
            <p>
              Corrélation de Pearson: {(() => {
                try {
                  const n = chartData.length
                  const sumX = chartData.reduce((sum, p) => sum + (p.x as number), 0)
                  const sumY = chartData.reduce((sum, p) => sum + (p.y as number), 0)
                  const sumXY = chartData.reduce((sum, p) => sum + (p.x as number) * (p.y as number), 0)
                  const sumX2 = chartData.reduce((sum, p) => sum + (p.x as number) * (p.x as number), 0)
                  const sumY2 = chartData.reduce((sum, p) => sum + (p.y as number) * (p.y as number), 0)

                  const numerator = n * sumXY - sumX * sumY
                  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

                  if (denominator === 0) return "N/A"

                  const r = numerator / denominator
                  return r.toFixed(3)
                } catch (err) {
                  console.error("[v0] Correlation calculation error:", err)
                  return "Erreur"
                }
              })()}
            </p>
          )}
          <p className="text-xs">
            {data2 && data2.length > 0
              ? "Nuage de points montrant la relation entre deux variables"
              : "Nuage de points montrant la distribution des valeurs"}
          </p>
        </div>
      </div>
    )
  } catch (err) {
    console.error("[v0] Scatter plot rendering error:", err)
    return (
      <div className="flex items-center justify-center h-[400px] text-destructive">
        Erreur lors de la génération du nuage de points
      </div>
    )
  }
}
