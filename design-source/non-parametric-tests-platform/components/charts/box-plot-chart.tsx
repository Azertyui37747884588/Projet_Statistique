"use client"

import { useMemo } from "react"

interface BoxPlotChartProps {
  data: number[]
  data2?: number[]
}

export function BoxPlotChart({ data, data2 }: BoxPlotChartProps) {
  const stats1 = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { min: 0, q1: 0, q2: 0, q3: 0, max: 0, outliers: [] }
    }
    return calculateBoxPlotStats(data)
  }, [data])

  const stats2 = useMemo(() => {
    if (data2 && data2.length > 0) {
      return calculateBoxPlotStats(data2)
    }
    return null
  }, [data2])

  const calculateBoxPlotStats = (values: number[]) => {
    try {
      if (!values || values.length === 0) {
        throw new Error("Données vides")
      }

      const sorted = [...values].sort((a, b) => a - b)
      const q1Index = Math.floor(sorted.length * 0.25)
      const q2Index = Math.floor(sorted.length * 0.5)
      const q3Index = Math.floor(sorted.length * 0.75)

      const q1 = sorted[q1Index] ?? sorted[0]
      const q2 = sorted.length % 2 === 0 ? (sorted[q2Index - 1] + sorted[q2Index]) / 2 : sorted[q2Index]
      const q3 = sorted[q3Index] ?? sorted[sorted.length - 1]
      const iqr = q3 - q1

      const lowerFence = q1 - 1.5 * iqr
      const upperFence = q3 + 1.5 * iqr

      const min = sorted.find((v) => v >= lowerFence) || sorted[0]
      const max = sorted.reverse().find((v) => v <= upperFence) || sorted[0]
      sorted.reverse()

      const outliers = sorted.filter((v) => v < lowerFence || v > upperFence)

      return { min, q1, q2, q3, max, outliers }
    } catch (err) {
      console.error("[v0] Box plot calculation error:", err)
      return { min: 0, q1: 0, q2: 0, q3: 0, max: 0, outliers: [] }
    }
  }

  const renderBoxPlot = (stats: ReturnType<typeof calculateBoxPlotStats>, x: number, color: string, label: string) => {
    if (!stats || stats.min === undefined || stats.max === undefined) {
      return null
    }

    const yScale = 400
    const yOffset = 50
    const dataRange =
      Math.max(stats.max, ...(stats2 ? [stats2.max] : [])) - Math.min(stats.min, ...(stats2 ? [stats2.min] : []))
    const scale = dataRange > 0 ? (yScale - 100) / dataRange : 1
    const minValue = Math.min(stats.min, ...(stats2 ? [stats2.min] : []))

    const getY = (value: number) => yScale - (value - minValue) * scale + yOffset

    return (
      <g>
        {/* Whisker lines */}
        <line
          x1={x}
          y1={getY(stats.min)}
          x2={x}
          y2={getY(stats.q1)}
          stroke={color}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <line
          x1={x}
          y1={getY(stats.q3)}
          x2={x}
          y2={getY(stats.max)}
          stroke={color}
          strokeWidth="2"
          strokeDasharray="4"
        />

        {/* Min/Max caps */}
        <line x1={x - 15} y1={getY(stats.min)} x2={x + 15} y2={getY(stats.min)} stroke={color} strokeWidth="2" />
        <line x1={x - 15} y1={getY(stats.max)} x2={x + 15} y2={getY(stats.max)} stroke={color} strokeWidth="2" />

        {/* Box (IQR) */}
        <rect
          x={x - 30}
          y={getY(stats.q3)}
          width="60"
          height={getY(stats.q1) - getY(stats.q3)}
          fill={color}
          fillOpacity="0.3"
          stroke={color}
          strokeWidth="2"
        />

        {/* Median line */}
        <line x1={x - 30} y1={getY(stats.q2)} x2={x + 30} y2={getY(stats.q2)} stroke={color} strokeWidth="3" />

        {/* Outliers */}
        {stats.outliers?.map((outlier, i) => (
          <circle key={i} cx={x} cy={getY(outlier)} r="4" fill={color} opacity="0.6" />
        ))}

        {/* Label */}
        <text x={x} y={yScale + yOffset + 30} textAnchor="middle" fill="currentColor" fontSize="14">
          {label}
        </text>
      </g>
    )
  }

  return (
    <div className="space-y-4">
      <svg width="100%" height="500" viewBox="0 0 600 550" className="mx-auto">
        {/* Y-axis */}
        <line x1="80" y1="50" x2="80" y2="450" stroke="currentColor" strokeWidth="1" opacity="0.3" />

        {/* Grid lines and labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
          const dataRange =
            Math.max(stats1.max, ...(stats2 ? [stats2.max] : [])) -
            Math.min(stats1.min, ...(stats2 ? [stats2.min] : []))
          const minValue = Math.min(stats1.min, ...(stats2 ? [stats2.min] : []))
          const value = minValue + dataRange * fraction
          const y = 450 - fraction * 350
          return (
            <g key={i}>
              <line x1="80" y1={y} x2="520" y2={y} stroke="currentColor" strokeWidth="1" opacity="0.1" />
              <text x="70" y={y + 5} textAnchor="end" fill="currentColor" fontSize="12" opacity="0.6">
                {value.toFixed(1)}
              </text>
            </g>
          )
        })}

        {/* Box plots */}
        {renderBoxPlot(stats1, data2 ? 220 : 300, "hsl(var(--chart-1))", "Série 1")}
        {stats2 && renderBoxPlot(stats2, 380, "hsl(var(--chart-2))", "Série 2")}
      </svg>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground">Minimum</p>
          <p className="font-semibold">{stats1.min.toFixed(2)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Q1</p>
          <p className="font-semibold">{stats1.q1.toFixed(2)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Médiane</p>
          <p className="font-semibold">{stats1.q2.toFixed(2)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Q3</p>
          <p className="font-semibold">{stats1.q3.toFixed(2)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Maximum</p>
          <p className="font-semibold">{stats1.max.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
