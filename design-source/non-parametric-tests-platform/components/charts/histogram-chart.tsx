"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface HistogramChartProps {
  data: number[]
}

export function HistogramChart({ data }: HistogramChartProps) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">Aucune donnée à afficher</div>
    )
  }

  try {
    const min = Math.min(...data)
    const max = Math.max(...data)

    if (min === max) {
      return (
        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
          Toutes les valeurs sont identiques ({min.toFixed(2)})
        </div>
      )
    }

    const binCount = Math.min(10, Math.ceil(Math.sqrt(data.length)))
    const binWidth = (max - min) / binCount

    const bins = Array.from({ length: binCount }, (_, i) => {
      const binStart = min + i * binWidth
      const binEnd = binStart + binWidth
      const count = data.filter((v) => v >= binStart && (i === binCount - 1 ? v <= binEnd : v < binEnd)).length

      return {
        range: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
        count: count,
        frequency: ((count / data.length) * 100).toFixed(1),
      }
    })

    const handleBarClick = (data: any, index: number) => {
      try {
        if (!data || !bins || index === undefined || index < 0 || index >= bins.length) return
        const bin = bins[index]
        if (!bin) return
        console.log("[v0] Histogram bar clicked:", bin)
      } catch (err) {
        console.error("[v0] Histogram click error:", err)
      }
    }

    return (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={bins}
            onClick={(e) => {
              try {
                if (!e || e.activeTooltipIndex === undefined) return
                handleBarClick(e, e.activeTooltipIndex)
              } catch (err) {
                console.error("[v0] Chart onClick error:", err)
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Fréquence" />
          </BarChart>
        </ResponsiveContainer>

        <div className="text-sm text-muted-foreground">
          <p>Nombre de classes: {binCount}</p>
          <p>Largeur de classe: {binWidth.toFixed(2)}</p>
          <p>Total d'observations: {data.length}</p>
        </div>
      </div>
    )
  } catch (err) {
    console.error("[v0] Histogram rendering error:", err)
    return (
      <div className="flex items-center justify-center h-[400px] text-destructive">
        Erreur lors de la génération de l'histogramme
      </div>
    )
  }
}
