"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface DataPreviewProps {
  headers: string[]
  data: any[][]
}

export function DataPreview({ headers, data }: DataPreviewProps) {
  const previewRows = data.slice(0, 10)
  const totalRows = data.length

  // Calculate basic statistics for numeric columns
  const getColumnStats = (colIndex: number) => {
    const values = data.map((row) => Number.parseFloat(row[colIndex])).filter((val) => !isNaN(val))

    if (values.length === 0) return null

    const sum = values.reduce((a, b) => a + b, 0)
    const mean = sum / values.length
    const sorted = [...values].sort((a, b) => a - b)
    const min = sorted[0]
    const max = sorted[sorted.length - 1]

    return { mean: mean.toFixed(2), min, max, count: values.length }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Aperçu des données</CardTitle>
            <CardDescription>
              Affichage des {Math.min(10, totalRows)} premières lignes sur {totalRows} au total
            </CardDescription>
          </div>
          <Badge variant="secondary">{headers.length} colonnes</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                {headers.map((header, index) => (
                  <TableHead key={index}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="text-center text-muted-foreground">{rowIndex + 1}</TableCell>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalRows > 10 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            ... et {totalRows - 10} lignes supplémentaires
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {headers.map((header, index) => {
            const stats = getColumnStats(index)
            return stats ? (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">{header}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Moyenne:</span>
                    <span className="font-medium">{stats.mean}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min:</span>
                    <span className="font-medium">{stats.min}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max:</span>
                    <span className="font-medium">{stats.max}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valeurs:</span>
                    <span className="font-medium">{stats.count}</span>
                  </div>
                </CardContent>
              </Card>
            ) : null
          })}
        </div>
      </CardContent>
    </Card>
  )
}
