"use client"

import type React from "react"

import { useState } from "react"
import { useData } from "@/contexts/data-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X } from "lucide-react"
import { DataPreview } from "@/components/data-preview"
import * as XLSX from "xlsx"

export default function UploadPage() {
  const { setUploadedData } = useData()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<any[][] | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return

    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
      setError("Format de fichier non supporté. Veuillez téléverser un fichier CSV ou Excel.")
      return
    }

    setFile(selectedFile)
    setError("")
    parseFile(selectedFile)
  }

  const parseFile = async (file: File) => {
    setIsLoading(true)
    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase()

      if (fileExtension === "xlsx" || fileExtension === "xls") {
        // Parse Excel file
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: "array" })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convert to array of arrays
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][]

        if (jsonData.length === 0) {
          setError("Le fichier Excel est vide.")
          setIsLoading(false)
          return
        }

        // Extract headers and data
        const parsedHeaders = jsonData[0].map((h: any) => String(h || "").trim())
        const parsedData = jsonData.slice(1).filter((row) => row.some((cell) => cell !== ""))

        setHeaders(parsedHeaders)
        setData(parsedData)
        setUploadedData(parsedHeaders, parsedData)
      } else {
        // Parse CSV file
        const text = await file.text()
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length === 0) {
          setError("Le fichier est vide.")
          setIsLoading(false)
          return
        }

        // Parse CSV (handle both comma and semicolon separators)
        const parsedData = lines.map((line) => {
          const separator = line.includes(";") ? ";" : ","
          return line.split(separator).map((cell) => cell.trim().replace(/^"|"$/g, ""))
        })

        const parsedHeaders = parsedData[0]
        const parsedDataRows = parsedData.slice(1)

        setHeaders(parsedHeaders)
        setData(parsedDataRows)
        setUploadedData(parsedHeaders, parsedDataRows)
      }
    } catch (err) {
      setError("Erreur lors de la lecture du fichier. Assurez-vous que le fichier est valide.")
      console.error("[v0] File parsing error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileChange(droppedFile)
    }
  }

  const clearFile = () => {
    setFile(null)
    setData(null)
    setHeaders([])
    setError("")
  }

  const handleGoToTests = () => {
    router.push("/tests")
  }

  const handleGoToVisualization = () => {
    router.push("/visualisation")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Téléversement de données</h1>
          <p className="text-muted-foreground">
            Importez vos fichiers CSV ou Excel pour commencer l'analyse statistique.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Importer un fichier</CardTitle>
            <CardDescription>Formats acceptés : CSV, XLS, XLSX (max 10 MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : file
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-border hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!file ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground mb-1">Glissez-déposez votre fichier ici</p>
                    <p className="text-sm text-muted-foreground">ou cliquez pour parcourir</p>
                  </div>
                  <div>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="file-upload">
                      <Button asChild disabled={isLoading}>
                        <span>{isLoading ? "Chargement..." : "Sélectionner un fichier"}</span>
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <p className="text-lg font-medium text-foreground">{file.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB • {data?.length || 0} lignes
                    </p>
                  </div>
                  <Button variant="outline" onClick={clearFile}>
                    <X className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {data && data.length > 0 && (
          <>
            <DataPreview headers={headers} data={data} />

            <Card>
              <CardHeader>
                <CardTitle>Prochaines étapes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1" onClick={handleGoToTests}>
                    Effectuer un test statistique
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={handleGoToVisualization}>
                    Visualiser les données
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
