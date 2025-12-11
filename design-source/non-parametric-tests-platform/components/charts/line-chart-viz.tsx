"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface LineChartVizProps {
  data: number[]
  data2?: number[]
}

export function LineChartViz({ data, data2 }: LineChartVizProps) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">Aucune donnée à afficher</div>
    )
  }

  try {
    const maxLength = Math.max(data.length, data2?.length || 0)

    const chartData = Array.from({ length: maxLength }, (_, index) => {
      const point: any = { index: index + 1 }

      if (index < data.length && data[index] !== null && data[index] !== undefined) {
        point.serie1 = data[index]
      }

      if (
        data2 &&
        Array.isArray(data2) &&
        index < data2.length &&
        data2[index] !== null &&
        data2[index] !== undefined
      ) {
        point.serie2 = data2[index]
      }

      return point
    })

    const hasValidData = chartData.some((point) => point.serie1 !== undefined || point.serie2 !== undefined)
    if (!hasValidData) {
      return (
        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
          Aucune donnée valide à afficher
        </div>
      )
    }

    const handleLineClick = (e: any) => {
      try {
        // Recharts onClick guard - check if event and activePayload exist
        if (!e || !e?.activePayload || !Array.isArray(e.activePayload) || e.activePayload.length === 0) return
        const payload = e.activePayload[0]?.payload
        if (!payload) return
        console.log("[v0] Line point clicked:", payload)
      } catch (err) {
        console.error("[v0] Line click error:", err)
      }
    }

    return (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} onClick={handleLineClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="index"
              label={{ value: "Index", position: "insideBottom", offset: -5 }}
              stroke="hsl(var(--foreground))"
            />
            <YAxis label={{ value: "Valeur", angle: -90, position: "insideLeft" }} stroke="hsl(var(--foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="serie1"
              stroke="hsl(var(--chart-1))"
              name="Série 1"
              strokeWidth={2}
              connectNulls={true}
              dot={{ r: 3, fill: "hsl(var(--chart-1))" }}
              activeDot={{ r: 5 }}
            />
            {data2 && Array.isArray(data2) && data2.length > 0 && (
              <Line
                type="monotone"
                dataKey="serie2"
                stroke="hsl(var(--chart-2))"
                name="Série 2"
                strokeWidth={2}
                connectNulls={true}
                dot={{ r: 3, fill: "hsl(var(--chart-2))" }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Nombre de points (Série 1): {data.length}</p>
          {data2 && Array.isArray(data2) && data2.length > 0 && <p>Nombre de points (Série 2): {data2.length}</p>}
          <p className="text-xs">Graphique en courbe montrant l'évolution des valeurs</p>
        </div>
      </div>
    )
  } catch (err) {
    console.error("[v0] Line chart rendering error:", err)
    return (
      <div className="flex items-center justify-center h-[400px] text-destructive">
        Erreur lors de la génération du graphique en courbe
      </div>
    )
  }
}
